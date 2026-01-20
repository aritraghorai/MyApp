import { prisma } from "@/lib/prisma";
import type { NoteTagModel } from "./model";

/**
 * Note Tags Service
 * Handles tag management business logic
 */
export abstract class NoteTagService {
    static async getAll(userId: string) {
        const tags = await prisma.noteTag.findMany({
            where: { userId },
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
    }

    static async create(data: NoteTagModel.Create, userId: string) {
        // Check if tag already exists
        const existing = await prisma.noteTag.findFirst({
            where: {
                userId,
                name: data.name,
            },
        });

        if (existing) {
            throw new Error("Tag already exists");
        }

        return await prisma.noteTag.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    static async update(id: string, data: NoteTagModel.Update) {
        return await prisma.noteTag.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string) {
        return await prisma.noteTag.delete({
            where: { id },
        });
    }

    static async addToNote(noteId: string, tagId: string) {
        return await prisma.dailyNoteTag.create({
            data: {
                noteId,
                tagId,
            },
        });
    }

    static async removeFromNote(noteId: string, tagId: string) {
        return await prisma.dailyNoteTag.deleteMany({
            where: {
                noteId,
                tagId,
            },
        });
    }

    static async getAnalytics(userId: string) {
        const tags = await prisma.noteTag.findMany({
            where: { userId },
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
            totalUses: tag.notes.length,
            lastUsed: tag.notes.length > 0
                ? tag.notes.reduce((latest, note) =>
                    note.note.date > latest ? note.note.date : latest,
                    tag.notes[0].note.date
                )
                : null,
        }));
    }
}
