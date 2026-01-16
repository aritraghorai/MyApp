import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { authPlugin } from "../auth-plugin";

/**
 * Tag Management Routes
 */
export const noteTags = new Elysia({ prefix: "/notes/tags" })
    .use(authPlugin)
    .model({
        createTag: t.Object({
            name: t.String(),
            color: t.Optional(t.String()),
        }),
        updateTag: t.Object({
            name: t.Optional(t.String()),
            color: t.Optional(t.String()),
        }),
    })
    // Get all user tags
    .get(
        "/",
        async ({ user }) => {
            const tags = await prisma.noteTag.findMany({
                where: { userId: user.id },
                include: {
                    notes: {
                        select: { noteId: true },
                    },
                },
                orderBy: { name: "asc" },
            });

            // Add usage count to each tag
            return tags.map((tag) => ({
                ...tag,
                usageCount: tag.notes.length,
            }));
        },
        { auth: true }
    )
    // Create new tag
    .post(
        "/",
        async ({ body, user, set }) => {
            const { name, color } = body;

            // Check if tag already exists
            const existing = await prisma.noteTag.findFirst({
                where: {
                    userId: user.id,
                    name: name.toLowerCase(),
                },
            });

            if (existing) {
                set.status = 400;
                return { error: "Tag already exists" };
            }

            return await prisma.noteTag.create({
                data: {
                    name: name.toLowerCase(),
                    color: color || "#3b82f6",
                    userId: user.id,
                },
            });
        },
        {
            auth: true,
            body: "createTag",
        }
    )
    // Update tag
    .patch(
        "/:id",
        async ({ params: { id }, body, user, set }) => {
            const tag = await prisma.noteTag.findUnique({ where: { id } });

            if (!tag) {
                set.status = 404;
                return { error: "Tag not found" };
            }

            if (tag.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            return await prisma.noteTag.update({
                where: { id },
                data: body,
            });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: "updateTag",
        }
    )
    // Delete tag
    .delete(
        "/:id",
        async ({ params: { id }, user, set }) => {
            const tag = await prisma.noteTag.findUnique({ where: { id } });

            if (!tag) {
                set.status = 404;
                return { error: "Tag not found" };
            }

            if (tag.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            return await prisma.noteTag.delete({ where: { id } });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
        }
    )
    // Add tag to note
    .post(
        "/note/:noteId/tag/:tagId",
        async ({ params: { noteId, tagId }, user, set }) => {
            // Verify note belongs to user
            const note = await prisma.dailyNote.findUnique({ where: { id: noteId } });
            if (!note || note.userId !== user.id) {
                set.status = 404;
                return { error: "Note not found" };
            }

            // Verify tag belongs to user
            const tag = await prisma.noteTag.findUnique({ where: { id: tagId } });
            if (!tag || tag.userId !== user.id) {
                set.status = 404;
                return { error: "Tag not found" };
            }

            // Check if already tagged
            const existing = await prisma.dailyNoteTag.findUnique({
                where: {
                    noteId_tagId: { noteId, tagId },
                },
            });

            if (existing) {
                return { message: "Already tagged" };
            }

            return await prisma.dailyNoteTag.create({
                data: { noteId, tagId },
            });
        },
        {
            auth: true,
            params: t.Object({
                noteId: t.String(),
                tagId: t.String(),
            }),
        }
    )
    // Remove tag from note
    .delete(
        "/note/:noteId/tag/:tagId",
        async ({ params: { noteId, tagId }, user, set }) => {
            // Verify note belongs to user
            const note = await prisma.dailyNote.findUnique({ where: { id: noteId } });
            if (!note || note.userId !== user.id) {
                set.status = 404;
                return { error: "Note not found" };
            }

            return await prisma.dailyNoteTag.delete({
                where: {
                    noteId_tagId: { noteId, tagId },
                },
            });
        },
        {
            auth: true,
            params: t.Object({
                noteId: t.String(),
                tagId: t.String(),
            }),
        }
    )
    // Get tag analytics
    .get(
        "/analytics",
        async ({ user }) => {
            const tags = await prisma.noteTag.findMany({
                where: { userId: user.id },
                include: {
                    notes: {
                        include: {
                            note: {
                                select: {
                                    date: true,
                                },
                            },
                        },
                    },
                },
            });

            return tags.map((tag) => ({
                id: tag.id,
                name: tag.name,
                color: tag.color,
                usageCount: tag.notes.length,
                lastUsed: tag.notes.length > 0
                    ? new Date(
                        Math.max(
                            ...tag.notes.map((n) => new Date(n.note.date).getTime())
                        )
                    )
                    : null,
            }));
        },
        { auth: true }
    );
