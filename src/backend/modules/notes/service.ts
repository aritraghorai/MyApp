/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { prisma } from "@/lib/prisma";
import { calculateWordCount, parseTodos } from "@/lib/todo-parser";
import type { NoteModel } from "./model";

/**
 * Notes Service
 * Handles all business logic for notes and all sub-resources
 */

// ===== Main Notes Service =====
export abstract class NoteService {
    static async getByDate(userId: string, dateStr: string) {
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        return await prisma.dailyNote.findFirst({
            where: {
                userId,
                date: targetDate,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                todos: {
                    orderBy: { position: "asc" },
                },
            },
        });
    }

    static async getRange(
        userId: string,
        from: string,
        to: string,
        tags?: string,
        mood?: string,
    ) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        const where: any = {
            userId,
            date: {
                gte: fromDate,
                lte: toDate,
            },
        };

        if (mood) {
            where.mood = parseInt(mood, 10);
        }

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

        return await prisma.dailyNote.findMany({
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
    }

    static async createOrUpdate(data: NoteModel.Create, userId: string) {
        const { date, content, mood } = data;

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const wordCount = calculateWordCount(content);
        const parsedTodos = parseTodos(content);

        const existing = await prisma.dailyNote.findFirst({
            where: {
                userId,
                date: targetDate,
            },
        });

        if (existing) {
            // Save current content to history before updating
            await prisma.noteHistory.create({
                data: {
                    noteId: existing.id,
                    content: existing.content,
                    userId,
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
            await prisma.todoItem.deleteMany({
                where: { noteId: existing.id },
            });

            if (parsedTodos.length > 0) {
                await prisma.todoItem.createMany({
                    data: parsedTodos.map((todo) => ({
                        noteId: existing.id,
                        content: todo.content,
                        completed: todo.completed,
                        priority: todo.priority,
                        position: todo.position,
                        userId,
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
                userId,
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
                    userId,
                })),
            });
        }

        return newNote;
    }

    static async delete(id: string) {
        return await prisma.dailyNote.delete({
            where: { id },
        });
    }

    static async getHistory(id: string) {
        return await prisma.noteHistory.findMany({
            where: { noteId: id },
            orderBy: { createdAt: "desc" },
        });
    }

    static async restore(noteId: string, historyId: string, userId: string) {
        const note = await prisma.dailyNote.findUnique({ where: { id: noteId } });
        const historyEntry = await prisma.noteHistory.findUnique({
            where: { id: historyId },
        });

        if (!note || !historyEntry) {
            throw new Error("Note or history entry not found");
        }

        // Save current content to history before restoring
        await prisma.noteHistory.create({
            data: {
                noteId: note.id,
                content: note.content,
                userId,
            },
        });

        // Restore the note to the historical content
        return await prisma.dailyNote.update({
            where: { id: noteId },
            data: { content: historyEntry.content },
        });
    }

    static async verifyOwnership(id: string, userId: string): Promise<boolean> {
        const note = await prisma.dailyNote.findUnique({ where: { id } });
        return note?.userId === userId;
    }
}

// Continued in next section...
