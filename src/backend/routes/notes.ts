import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { authPlugin } from "../auth-plugin";

export const notes = new Elysia({ prefix: "/notes" })
    .use(authPlugin)
    .model({
        note: t.Object({
            date: t.String(), // ISO Date string (YYYY-MM-DD)
            content: t.String(),
        }),
    })
    .get(
        "/",
        async ({ query, user }) => {
            const { date } = query;

            if (!date) {
                return { error: "Date parameter is required" };
            }

            // Parse the date string to start of day
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            const note = await prisma.dailyNote.findFirst({
                where: {
                    userId: user.id,
                    date: targetDate,
                },
            });

            return note;
        },
        {
            auth: true,
            query: t.Object({
                date: t.String(),
            }),
        },
    )
    .get(
        "/range",
        async ({ query, user }) => {
            const { from, to } = query;

            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);

            const notes = await prisma.dailyNote.findMany({
                where: {
                    userId: user.id,
                    date: {
                        gte: fromDate,
                        lte: toDate,
                    },
                },
                orderBy: {
                    date: "desc",
                },
            });

            return notes;
        },
        {
            auth: true,
            query: t.Object({
                from: t.String(),
                to: t.String(),
            }),
        },
    )
    .post(
        "/",
        async ({ body, user, set }) => {
            const { date, content } = body;

            // Parse the date string to start of day
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            // Check if a note already exists for this date
            const existing = await prisma.dailyNote.findFirst({
                where: {
                    userId: user.id,
                    date: targetDate,
                },
            });

            if (existing) {
                // Save current content to history before updating
                await prisma.noteHistory.create({
                    data: {
                        noteId: existing.id,
                        content: existing.content,
                        userId: user.id,
                    },
                });

                // Update existing note
                return await prisma.dailyNote.update({
                    where: { id: existing.id },
                    data: { content },
                });
            }

            // Create new note
            return await prisma.dailyNote.create({
                data: {
                    date: targetDate,
                    content,
                    userId: user.id,
                },
            });
        },
        {
            auth: true,
            body: "note",
        },
    )
    .delete(
        "/:id",
        async ({ params: { id }, user, set }) => {
            const existing = await prisma.dailyNote.findUnique({ where: { id } });
            if (!existing) {
                set.status = 404;
                return "Note not found";
            }
            if (existing.userId !== user.id) {
                set.status = 403;
                return "Forbidden";
            }

            return await prisma.dailyNote.delete({
                where: { id },
            });
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    .get(
        "/:id/history",
        async ({ params: { id }, user, set }) => {
            // Verify the note belongs to the user
            const note = await prisma.dailyNote.findUnique({ where: { id } });
            if (!note) {
                set.status = 404;
                return "Note not found";
            }
            if (note.userId !== user.id) {
                set.status = 403;
                return "Forbidden";
            }

            // Fetch all history for this note
            const history = await prisma.noteHistory.findMany({
                where: { noteId: id },
                orderBy: { createdAt: "desc" },
            });

            return history;
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    .post(
        "/:id/restore/:historyId",
        async ({ params: { id, historyId }, user, set }) => {
            // Verify the note belongs to the user
            const note = await prisma.dailyNote.findUnique({ where: { id } });
            if (!note) {
                set.status = 404;
                return "Note not found";
            }
            if (note.userId !== user.id) {
                set.status = 403;
                return "Forbidden";
            }

            // Verify the history entry exists and belongs to this note
            const historyEntry = await prisma.noteHistory.findUnique({
                where: { id: historyId },
            });
            if (!historyEntry) {
                set.status = 404;
                return "History entry not found";
            }
            if (historyEntry.noteId !== id || historyEntry.userId !== user.id) {
                set.status = 403;
                return "Forbidden";
            }

            // Save current content to history before restoring
            await prisma.noteHistory.create({
                data: {
                    noteId: note.id,
                    content: note.content,
                    userId: user.id,
                },
            });

            // Restore the note to the historical content
            return await prisma.dailyNote.update({
                where: { id },
                data: { content: historyEntry.content },
            });
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
                historyId: t.String(),
            }),
        },
    );
