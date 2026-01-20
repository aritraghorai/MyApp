import { prisma } from "@/lib/prisma";
import type { CategoryModel } from "./model";

export abstract class CategoryService {
	static async getAll(userId: string) {
		return await prisma.category.findMany({
			where: { userId },
			orderBy: { name: "asc" },
		});
	}

	static async getById(id: string) {
		return await prisma.category.findUnique({
			where: { id },
		});
	}

	static async create(data: CategoryModel.Create, userId: string) {
		return await prisma.category.create({
			data: {
				...data,
				userId,
			},
		});
	}

	static async update(id: string, data: CategoryModel.Update) {
		return await prisma.category.update({
			where: { id },
			data,
		});
	}

	static async delete(id: string) {
		return await prisma.category.delete({
			where: { id },
		});
	}
}
