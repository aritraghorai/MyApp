import { prisma } from "@/lib/prisma";
import type { TagModel } from "./model";

export abstract class TagService {
	static async getAll(userId: string) {
		return await prisma.tag.findMany({
			where: { userId },
			orderBy: { name: "asc" },
		});
	}

	static async getById(id: string) {
		return await prisma.tag.findUnique({
			where: { id },
		});
	}

	static async create(data: TagModel.Create, userId: string) {
		return await prisma.tag.create({
			data: {
				...data,
				userId,
			},
		});
	}

	static async update(id: string, data: TagModel.Update) {
		return await prisma.tag.update({
			where: { id },
			data,
		});
	}

	static async delete(id: string) {
		return await prisma.tag.delete({
			where: { id },
		});
	}
}
