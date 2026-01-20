import { prisma } from "@/lib/prisma";
import type { ExpenseAccountModel } from "./model";

/**
 * Expense Account Service
 * Handles business logic and database operations
 */
export abstract class ExpenseAccountService {
	/**
	 * Get all accounts for a user
	 */
	static async getAll(userId: string) {
		return await prisma.expenseAccount.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Get account by ID
	 */
	static async getById(id: string) {
		return await prisma.expenseAccount.findUnique({
			where: { id },
		});
	}

	/**
	 * Create new account
	 */
	static async create(data: ExpenseAccountModel.Create, userId: string) {
		return await prisma.expenseAccount.create({
			data: {
				...data,
				userId,
			},
		});
	}

	/**
	 * Update account
	 */
	static async update(id: string, data: ExpenseAccountModel.Update) {
		return await prisma.expenseAccount.update({
			where: { id },
			data,
		});
	}

	/**
	 * Delete account
	 */
	static async delete(id: string) {
		return await prisma.expenseAccount.delete({
			where: { id },
		});
	}

	/**
	 * Check if account exists
	 */
	static async exists(id: string): Promise<boolean> {
		const count = await prisma.expenseAccount.count({
			where: { id },
		});
		return count > 0;
	}
}
