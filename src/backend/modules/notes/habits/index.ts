import { differenceInDays, startOfDay, subDays } from "date-fns";
import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { authPlugin } from "../../../auth-plugin";

/**
 * Habit Tracking Routes
 */
export const noteHabits = new Elysia({ prefix: "/habits" })
    .use(authPlugin)
    .model({
        createHabit: t.Object({
            name: t.String(),
            description: t.Optional(t.String()),
            color: t.Optional(t.String()),
            frequency: t.Optional(t.Union([t.Literal("DAILY"), t.Literal("WEEKLY"), t.Literal("MONTHLY")])),
            endDate: t.Optional(t.String()), // ISO date string
            metadataSchema: t.Optional(t.Any()), // JSON schema for metadata fields
        }),
        updateHabit: t.Object({
            name: t.Optional(t.String()),
            description: t.Optional(t.String()),
            color: t.Optional(t.String()),
            frequency: t.Optional(t.Union([t.Literal("DAILY"), t.Literal("WEEKLY"), t.Literal("MONTHLY")])),
            endDate: t.Optional(t.String()),
            metadataSchema: t.Optional(t.Any()),
        }),
        logHabit: t.Object({
            date: t.String(), // ISO date string
            completed: t.Boolean(),
            metadata: t.Optional(t.Any()), // JSON metadata values
            notes: t.Optional(t.String()), // Optional notes
        }),
    })
    // Get all user habits
    .get(
        "/",
        async ({ user }) => {
            return await prisma.habit.findMany({
                where: { userId: user.id },
                orderBy: { name: "asc" },
            });
        },
        { auth: true }
    )
    // Create new habit
    .post(
        "/",
        async ({ body, user, set }) => {
            const { name, description, color, frequency } = body;

            // Check if habit already exists
            const existing = await prisma.habit.findFirst({
                where: {
                    userId: user.id,
                    name,
                },
            });

            if (existing) {
                set.status = 400;
                return { error: "Habit already exists" };
            }

            return await prisma.habit.create({
                data: {
                    name,
                    description,
                    color: color || "#8b5cf6",
                    frequency: frequency || "DAILY",
                    endDate: body.endDate ? new Date(body.endDate) : null,
                    metadataSchema: body.metadataSchema || null,
                    userId: user.id,
                },
            });
        },
        {
            auth: true,
            body: "createHabit",
        }
    )
    // Update habit
    .patch(
        "/:id",
        async ({ params: { id }, body, user, set }) => {
            const habit = await prisma.habit.findUnique({ where: { id } });

            if (!habit) {
                set.status = 404;
                return { error: "Habit not found" };
            }

            if (habit.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            const updateData: any = {};
            if (body.name) updateData.name = body.name;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.color) updateData.color = body.color;
            if (body.frequency) updateData.frequency = body.frequency;
            if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
            if (body.metadataSchema !== undefined) updateData.metadataSchema = body.metadataSchema;

            return await prisma.habit.update({
                where: { id },
                data: updateData,
            });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: "updateHabit",
        }
    )
    // Delete habit
    .delete(
        "/:id",
        async ({ params: { id }, user, set }) => {
            const habit = await prisma.habit.findUnique({ where: { id } });

            if (!habit) {
                set.status = 404;
                return { error: "Habit not found" };
            }

            if (habit.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            return await prisma.habit.delete({ where: { id } });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
        }
    )
    // Log habit completion for a date
    .post(
        "/:id/log",
        async ({ params: { id }, body, user, set }) => {
            const habit = await prisma.habit.findUnique({ where: { id } });

            if (!habit) {
                set.status = 404;
                return { error: "Habit not found" };
            }

            if (habit.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            const logDate = startOfDay(new Date(body.date));

            // Check if log already exists
            const existing = await prisma.habitLog.findUnique({
                where: {
                    habitId_date: {
                        habitId: id,
                        date: logDate,
                    },
                },
            });

            if (existing) {
                // Update existing log
                return await prisma.habitLog.update({
                    where: { id: existing.id },
                    data: {
                        completed: body.completed,
                        metadata: body.metadata || null,
                        notes: body.notes || null,
                    },
                });
            }

            // Create new log
            return await prisma.habitLog.create({
                data: {
                    habitId: id,
                    date: logDate,
                    completed: body.completed,
                    metadata: body.metadata || null,
                    notes: body.notes || null,
                    userId: user.id,
                },
            });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: "logHabit",
        }
    )
    // Get habit logs for date range
    .get(
        "/logs",
        async ({ query, user }) => {
            const { from, to, habitId } = query;

            const fromDate = startOfDay(new Date(from));
            const toDate = startOfDay(new Date(to));

            const where: any = {
                userId: user.id,
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
            };

            if (habitId) {
                where.habitId = habitId;
            }

            return await prisma.habitLog.findMany({
                where,
                include: {
                    habit: true,
                },
                orderBy: { date: "desc" },
            });
        },
        {
            auth: true,
            query: t.Object({
                from: t.String(),
                to: t.String(),
                habitId: t.Optional(t.String()),
            }),
        }
    )
    // Get habit statistics
    .get(
        "/stats",
        async ({ query, user }) => {
            const { habitId } = query;

            const habits = habitId
                ? [await prisma.habit.findUnique({ where: { id: habitId } })]
                : await prisma.habit.findMany({ where: { userId: user.id } });

            const stats = await Promise.all(
                habits.filter(Boolean).map(async (habit) => {
                    if (!habit) return null;

                    const logs = await prisma.habitLog.findMany({
                        where: { habitId: habit.id },
                        orderBy: { date: "desc" },
                    });

                    const completedLogs = logs.filter((log) => log.completed);
                    const totalLogs = logs.length;
                    const completionRate = totalLogs > 0 ? (completedLogs.length / totalLogs) * 100 : 0;

                    // Calculate current streak
                    let currentStreak = 0;
                    const today = startOfDay(new Date());

                    for (let i = 0; i < 365; i++) {
                        const checkDate = subDays(today, i);
                        const log = logs.find(
                            (l) => startOfDay(new Date(l.date)).getTime() === checkDate.getTime()
                        );

                        if (log && log.completed) {
                            currentStreak++;
                        } else if (i > 0) {
                            // Allow one day gap for today
                            break;
                        }
                    }

                    // Calculate longest streak
                    let longestStreak = 0;
                    let tempStreak = 0;
                    const sortedLogs = [...logs].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                    for (let i = 0; i < sortedLogs.length; i++) {
                        if (sortedLogs[i].completed) {
                            tempStreak++;
                            longestStreak = Math.max(longestStreak, tempStreak);
                        } else {
                            tempStreak = 0;
                        }
                    }

                    return {
                        habitId: habit.id,
                        habitName: habit.name,
                        totalLogs,
                        completedLogs: completedLogs.length,
                        completionRate: Math.round(completionRate),
                        currentStreak,
                        longestStreak,
                        lastCompleted: completedLogs.length > 0 ? completedLogs[0].date : null,
                    };
                })
            );

            return stats.filter(Boolean);
        },
        {
            auth: true,
            query: t.Object({
                habitId: t.Optional(t.String()),
            }),
        }
    );
