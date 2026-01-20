import { startOfDay, subDays } from "date-fns";
import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { deleteTodoFromNote, parseTodos, updateTodoInMarkdown } from "@/lib/todo-parser";
import { authPlugin } from "../../../auth-plugin";

/**
 * Todo Management Routes
 */
export const noteTodos = new Elysia({ prefix: "/todos" })
    .use(authPlugin)
    .model({
        createTodo: t.Object({
            noteId: t.String(),
            content: t.String(),
            priority: t.Optional(t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")])),
            position: t.Optional(t.Number()),
        }),
        updateTodo: t.Object({
            content: t.Optional(t.String()),
            completed: t.Optional(t.Boolean()),
            priority: t.Optional(t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")])),
            position: t.Optional(t.Number()),
        }),
    })
    // Get todos for a specific note
    .get(
        "notes/:noteId",
        async ({ params: { noteId }, user, set }) => {
            const note = await prisma.dailyNote.findUnique({ where: { id: noteId } });

            if (!note) {
                set.status = 404;
                return { error: "Note not found" };
            }

            if (note.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            return await prisma.todoItem.findMany({
                where: { noteId },
                orderBy: { position: "asc" },
            });
        },
        {
            auth: true,
            params: t.Object({ noteId: t.String() }),
        }
    )
    // Extract todos from note content
    .post(
        "notes/:noteId/extract",
        async ({ params: { noteId }, user, set }) => {
            const note = await prisma.dailyNote.findUnique({ where: { id: noteId } });

            if (!note) {
                set.status = 404;
                return { error: "Note not found" };
            }

            if (note.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            // Parse todos from markdown content
            const parsedTodos = parseTodos(note.content);

            // Delete existing todos for this note
            await prisma.todoItem.deleteMany({
                where: { noteId },
            });

            // Create new todos
            const todos = await Promise.all(
                parsedTodos.map((todo) =>
                    prisma.todoItem.create({
                        data: {
                            noteId,
                            content: todo.content,
                            completed: todo.completed,
                            priority: todo.priority,
                            position: todo.position,
                            userId: user.id,
                        },
                    })
                )
            );

            return { count: todos.length, todos };
        },
        {
            auth: true,
            params: t.Object({ noteId: t.String() }),
        }
    )
    // Create todo manually
    .post(
        "/",
        async ({ body, user, set }) => {
            const { noteId, content, priority, position } = body;

            const note = await prisma.dailyNote.findUnique({ where: { id: noteId } });

            if (!note) {
                set.status = 404;
                return { error: "Note not found" };
            }

            if (note.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            // Get max position if not provided
            const maxPosition = position !== undefined
                ? position
                : (await prisma.todoItem.findFirst({
                    where: { noteId },
                    orderBy: { position: "desc" },
                }))?.position ?? 0;

            return await prisma.todoItem.create({
                data: {
                    noteId,
                    content,
                    priority: priority || "MEDIUM",
                    position: maxPosition + 1,
                    userId: user.id,
                },
            });
        },
        {
            auth: true,
            body: "createTodo",
        }
    )
    // Update todo
    .patch(
        "/:id",
        async ({ params: { id }, body, user, set }) => {
            const todo = await prisma.todoItem.findUnique({ where: { id } });

            if (!todo) {
                set.status = 404;
                return { error: "Todo not found" };
            }

            if (todo.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            const updatedTodo = await prisma.todoItem.update({
                where: { id },
                data: body,
            });
            //go to the notes and update the todo in notes also
            const note = await prisma.dailyNote.findUnique({ where: { id: updatedTodo.noteId } });
            if (!note) {
                set.status = 404;
                return { error: "Note not found" };
            }
            if (note.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }
            const updatedContent = updateTodoInMarkdown(note.content, todo.content, updatedTodo.completed)
            await prisma.dailyNote.update({
                where: { id: todo.noteId },
                data: {
                    content: updatedContent,
                },
            });
            return updatedTodo;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: "updateTodo",
        }
    )
    // Delete todo
    .delete(
        "/:id",
        async ({ params: { id }, user, set }) => {
            const todo = await prisma.todoItem.findUnique({ where: { id } });

            if (!todo) {
                set.status = 404;
                return { error: "Todo not found" };
            }

            if (todo.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            const deletedTodo = await prisma.todoItem.delete({ where: { id } });

            const note = await prisma.dailyNote.findUnique({ where: { id: deletedTodo.noteId } });
            if (!note) {
                set.status = 404;
                return { error: "Note not found" };
            }
            if (note.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }
            const updatedContent = deleteTodoFromNote(note.content, deletedTodo.content)
            await prisma.dailyNote.update({
                where: { id: deletedTodo.noteId },
                data: {
                    content: updatedContent,
                },
            });
            return deletedTodo;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
        }
    )
    // Get all incomplete todos
    .get(
        "/incomplete",
        async ({ query, user }) => {
            const { limit } = query;

            return await prisma.todoItem.findMany({
                where: {
                    userId: user.id,
                    completed: false,
                },
                include: {
                    note: {
                        select: {
                            date: true,
                        },
                    },
                },
                orderBy: [
                    { note: { date: "desc" } },
                    { position: "asc" },
                ],
                take: limit ? parseInt(limit) : undefined,
            });
        },
        {
            auth: true,
            query: t.Object({
                limit: t.Optional(t.String()),
            }),
        }
    )
    // Migrate incomplete todos to today
    .post(
        "/migrate",
        async ({ body, user, set }) => {
            const { toDate } = body;

            const targetDate = startOfDay(new Date(toDate));

            // Get or create note for target date
            let targetNote = await prisma.dailyNote.findFirst({
                where: {
                    userId: user.id,
                    date: targetDate,
                },
            });

            if (!targetNote) {
                targetNote = await prisma.dailyNote.create({
                    data: {
                        date: targetDate,
                        content: "# Migrated Todos\n\n",
                        userId: user.id,
                    },
                });
            }

            // Get incomplete todos from previous days
            const incompleteTodos = await prisma.todoItem.findMany({
                where: {
                    userId: user.id,
                    completed: false,
                    note: {
                        date: {
                            lt: targetDate,
                        },
                    },
                },
                include: {
                    note: true,
                },
                orderBy: [
                    { note: { date: "desc" } },
                    { position: "asc" },
                ],
            });

            if (incompleteTodos.length === 0) {
                return { message: "No incomplete todos to migrate", count: 0 };
            }

            // Get max position in target note
            const maxPosition = (await prisma.todoItem.findFirst({
                where: { noteId: targetNote.id },
                orderBy: { position: "desc" },
            }))?.position ?? -1;

            // Create new todos in target note
            const migratedTodos = await Promise.all(
                incompleteTodos.map((todo, index) =>
                    prisma.todoItem.create({
                        data: {
                            noteId: targetNote.id,
                            content: todo.content,
                            completed: false,
                            priority: todo.priority,
                            position: maxPosition + index + 1,
                            userId: user.id,
                        },
                    })
                )
            );

            // Update target note content to include migrated todos
            const todoMarkdown = migratedTodos
                .map((todo) => `- [ ] ${todo.content}`)
                .join("\n");

            await prisma.dailyNote.update({
                where: { id: targetNote.id },
                data: {
                    content: targetNote.content + "\n" + todoMarkdown,
                },
            });

            return {
                message: "Todos migrated successfully",
                count: migratedTodos.length,
                todos: migratedTodos,
            };
        },
        {
            auth: true,
            body: t.Object({
                toDate: t.String(), // ISO date string
            }),
        }
    )
    // Get todo statistics
    .get(
        "/stats",
        async ({ query, user }) => {
            const { from, to } = query;

            const fromDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 30);
            const toDate = to ? startOfDay(new Date(to)) : new Date();

            const todos = await prisma.todoItem.findMany({
                where: {
                    userId: user.id,
                    note: {
                        date: {
                            gte: fromDate,
                            lte: toDate,
                        },
                    },
                },
            });

            const total = todos.length;
            const completed = todos.filter((t) => t.completed).length;
            const incomplete = total - completed;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            const byPriority = {
                high: todos.filter((t) => t.priority === "HIGH").length,
                medium: todos.filter((t) => t.priority === "MEDIUM").length,
                low: todos.filter((t) => t.priority === "LOW").length,
            };

            return {
                total,
                completed,
                incomplete,
                completionRate,
                byPriority,
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
