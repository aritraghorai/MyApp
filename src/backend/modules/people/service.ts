import { prisma } from "@/lib/prisma";
import type { PersonModel } from "./model";

export abstract class PersonService {
	static async getAll(userId: string) {
		return await prisma.person.findMany({
			where: { userId },
			orderBy: { name: "asc" },
		});
	}

	static async getById(id: string) {
		return await prisma.person.findUnique({
			where: { id },
		});
	}

	static async create(data: PersonModel.Create, userId: string) {
		return await prisma.person.create({
			data: {
				...data,
				userId,
			},
		});
	}

	static async update(id: string, data: PersonModel.Update) {
		return await prisma.person.update({
			where: { id },
			data,
		});
	}

	static async delete(id: string) {
		return await prisma.person.delete({
			where: { id },
		});
	}
}
