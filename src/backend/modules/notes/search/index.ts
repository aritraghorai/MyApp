import { format, startOfDay, subDays } from "date-fns";
import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { authPlugin } from "../../../auth-plugin";

/**
 * Search and Analytics Routes
 */
export const noteSearch = new Elysia({ prefix: "/notes/search" })
    .use(authPlugin)
    // Full-text search across notes
    .get(
        "/",
        async ({ query, user }) => {
            const { q, from, to, tags, mood, hasTodos } = query;

            const fromDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 365);
            const toDate = to ? startOfDay(new Date(to)) : new Date();

            const where: any = {
                userId: user.id,
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
            };

            // Full-text search in content
            if (q) {
                where.content = {
                    contains: q,
                };
            }

            // Filter by mood
            if (mood) {
                where.mood = parseInt(mood);
            }

            // Filter by tags
            if (tags) {
                const tagNames = tags.split(",");
                where.tags = {
                    some: {
                        tag: {
                            name: {
                                in: tagNames,
                            },
                        },
                    },
                };
            }

            // Filter by has todos
            if (hasTodos === "true") {
                where.todos = {
                    some: {},
                };
            }

            const notes = await prisma.dailyNote.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    todos: true,
                },
                orderBy: {
                    date: "desc",
                },
                take: 50, // Limit results
            });

            return notes;
        },
        {
            auth: true,
            query: t.Object({
                q: t.Optional(t.String()), // Search query
                from: t.Optional(t.String()),
                to: t.Optional(t.String()),
                tags: t.Optional(t.String()), // Comma-separated
                mood: t.Optional(t.String()),
                hasTodos: t.Optional(t.String()), // "true" or "false"
            }),
        }
    )
    // Get analytics/statistics
    .get(
        "/analytics",
        async ({ query, user }) => {
            const { from, to } = query;

            const fromDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 30);
            const toDate = to ? startOfDay(new Date(to)) : new Date();

            // Get all notes in range
            const notes = await prisma.dailyNote.findMany({
                where: {
                    userId: user.id,
                    date: {
                        gte: fromDate,
                        lte: toDate,
                    },
                },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    todos: true,
                },
            });

            // Writing statistics
            const totalNotes = notes.length;
            const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
            const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

            // Calculate streak
            let currentStreak = 0;
            const today = startOfDay(new Date());
            for (let i = 0; i < 365; i++) {
                const checkDate = subDays(today, i);
                const hasNote = notes.some(
                    (note) => startOfDay(new Date(note.date)).getTime() === checkDate.getTime()
                );
                if (hasNote) {
                    currentStreak++;
                } else if (i > 0) {
                    break;
                }
            }

            // Tag statistics
            const tagUsage: Record<string, number> = {};
            notes.forEach((note) => {
                note.tags.forEach((noteTag) => {
                    const tagName = noteTag.tag.name;
                    tagUsage[tagName] = (tagUsage[tagName] || 0) + 1;
                });
            });

            const topTags = Object.entries(tagUsage)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, count]) => ({ name, count }));

            // Todo statistics
            const allTodos = notes.flatMap((note) => note.todos);
            const totalTodos = allTodos.length;
            const completedTodos = allTodos.filter((todo) => todo.completed).length;
            const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

            // Mood statistics
            const notesWithMood = notes.filter((note) => note.mood !== null);
            const avgMood = notesWithMood.length > 0
                ? (notesWithMood.reduce((sum, note) => sum + (note.mood || 0), 0) / notesWithMood.length).toFixed(1)
                : null;

            const moodDistribution = {
                1: notes.filter((n) => n.mood === 1).length,
                2: notes.filter((n) => n.mood === 2).length,
                3: notes.filter((n) => n.mood === 3).length,
                4: notes.filter((n) => n.mood === 4).length,
                5: notes.filter((n) => n.mood === 5).length,
            };

            // Daily word count trend (last 30 days)
            const wordCountTrend = [];
            for (let i = 29; i >= 0; i--) {
                const date = subDays(new Date(), i);
                const dateStr = format(date, "yyyy-MM-dd");
                const note = notes.find(
                    (n) => format(new Date(n.date), "yyyy-MM-dd") === dateStr
                );
                wordCountTrend.push({
                    date: dateStr,
                    wordCount: note?.wordCount || 0,
                });
            }

            return {
                writing: {
                    totalNotes,
                    totalWords,
                    avgWordsPerNote,
                    currentStreak,
                    wordCountTrend,
                },
                tags: {
                    totalUniqueTags: Object.keys(tagUsage).length,
                    topTags,
                    usage: tagUsage,
                },
                todos: {
                    total: totalTodos,
                    completed: completedTodos,
                    incomplete: totalTodos - completedTodos,
                    completionRate: todoCompletionRate,
                },
                mood: {
                    average: avgMood,
                    distribution: moodDistribution,
                    totalWithMood: notesWithMood.length,
                },
            };
        },
        {
            auth: true,
            query: t.Object({
                from: t.Optional(t.String()),
                to: t.Optional(t.String()),
            }),
        }
    );
