import { Elysia, t } from "elysia";
import { authPlugin } from "../../auth-plugin";

/**
 * Notes Module Controller
 * Consolidates all note-related routes following REST principles
 * All sub-resources are organized under /notes prefix
 */

import { prisma } from "@/lib/prisma";
import { calculateWordCount, parseTodos } from "@/lib/todo-parser";
// Import all note sub-resource modules
import { noteHabits } from "./habits";
import { NoteModel } from "./model";
import { noteSearch } from "./search";
import { NoteService } from "./service";
import { noteTags } from "./tags";
import { noteTemplates } from "./templates";
import { noteTodos } from "./todos";

/**
 * Notes Controller
 * REST Structure:
 * - GET/POST /notes - Main notes CRUD
 * - /notes/tags/* - Tag management
 * - /notes/templates/* - Template management  
 * - /notes/habits/* - Habit tracking
 * - /notes/todos/* - Todo management
 * - /notes/search/* - Search and analytics
 */
export const notes = new Elysia({ prefix: "/notes" })
    .use(authPlugin)
    .model({
        note: t.Object({
            date: t.String(), // ISO Date string (YYYY-MM-DD)
            content: t.String(),
            mood: t.Optional(t.Number()), // 1-5 scale
        }),
    })
    .get(
        "/",
        async ({ query, user }) => {
            const { date } = query;

            if (!date) {
                return { error: "Date parameter is required" };
            }
            return NoteService.getByDate(user.id, date);
        },
        {
            auth: true,
            query: NoteModel.dateQuery,
        },
    )
    .get(
        "/range",
        async ({ query, user }) => {
            const { from, to, tags, mood } = query;


            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);

            const where: any = {
                userId: user.id,
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
            };

            // Filter by mood if provided
            if (mood) {
                where.mood = parseInt(mood);
            }

            // Filter by tags if provided
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
            });

            return notes;
        },
        {
            auth: true,
            query: t.Object({
                from: t.String(),
                to: t.String(),
                tags: t.Optional(t.String()), // Comma-separated tag names
                mood: t.Optional(t.String()), // 1-5
            }),
        },
    )
    .post(
        "/",
        async ({ body, user }) => {
            const { date, content, mood } = body;

            // Parse the date string to start of day
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            // Calculate word count
            const wordCount = calculateWordCount(content);

            // Parse todos from content
            const parsedTodos = parseTodos(content);

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
                const updated = await prisma.dailyNote.update({
                    where: { id: existing.id },
                    data: {
                        content,
                        wordCount,
                        mood: mood !== undefined ? mood : existing.mood,
                    },
                });

                // Update todos
                // Delete existing todos
                await prisma.todoItem.deleteMany({
                    where: { noteId: existing.id },
                });

                // Create new todos
                if (parsedTodos.length > 0) {
                    await prisma.todoItem.createMany({
                        data: parsedTodos.map((todo) => ({
                            noteId: existing.id,
                            content: todo.content,
                            completed: todo.completed,
                            priority: todo.priority,
                            position: todo.position,
                            userId: user.id,
                        })),
                    });
                }

                return updated;
            }

            // Create new note
            const newNote = await prisma.dailyNote.create({
                data: {
                    date: targetDate,
                    content,
                    wordCount,
                    mood,
                    userId: user.id,
                },
            });

            // Create todos
            if (parsedTodos.length > 0) {
                await prisma.todoItem.createMany({
                    data: parsedTodos.map((todo) => ({
                        noteId: newNote.id,
                        content: todo.content,
                        completed: todo.completed,
                        priority: todo.priority,
                        position: todo.position,
                        userId: user.id,
                    })),
                });
            }

            return newNote;
        },
        {
            auth: true,
            body: "note",
        },
    )
    .group("/:id", {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    }, (app) => {
        return app.delete(
            "",
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
        ).get("/history", async ({ params: { id }, user, set }) => {
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
        }).post(
            "/restore/:historyId",
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
                params: t.Object({
                    historyId: t.String(),
                }),
            },
        )
    }).use(noteTags)

    // Sub-resource routes
    .use(noteTemplates)
    .use(noteHabits)
    .use(noteTodos)
    .use(noteSearch);
