import { prisma } from "@/lib/prisma";
import { getBilldingPeriodByDate } from "@/lib/utils";
import type { TransactionModel } from "./model";

/**
 * Transaction Service
 * Handles business logic and database operations
 */
export abstract class TransactionService {
	/**
	 * Get transactions with filtering (REST principle - query parameters)
	 */
	static async getAll(userId: string, query: TransactionModel.ListQuery) {
		const {
			page = 1,
			limit = 20,
			accountId,
			categoryId,
			personId,
			fromDate,
			toDate,
			billingCycle,
		} = query;

		const skip = (Number(page) - 1) * Number(limit);

		const where: any = {
			userId,
		};

		if (accountId) where.accountId = accountId;
		if (categoryId) where.categoryId = categoryId;
		if (personId) where.personId = personId;
		if (billingCycle) where.billingCycle = billingCycle;

		if (fromDate || toDate) {
			where.date = {};
			if (fromDate) where.date.gte = new Date(fromDate);
			if (toDate) where.date.lte = new Date(toDate);
		}

		const [data, total] = await Promise.all([
			prisma.transaction.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: { date: "desc" },
				include: {
					category: true,
					account: true,
					person: true,
					fromAccount: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
			}),
			prisma.transaction.count({ where }),
		]);

		return {
			data,
			meta: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / Number(limit)),
			},
		};
	}

	/**
	 * Get transaction by ID
	 */
	static async getById(id: string) {
		return await prisma.transaction.findUnique({
			where: { id },
			include: {
				category: true,
				account: true,
				person: true,
				fromAccount: true,
				tags: {
					include: {
						tag: true,
					},
				},
			},
		});
	}

	/**
	 * Create transaction
	 */
	static async create(data: TransactionModel.Create, userId: string) {
		const { tagIds, date, type, ...rest } = data;

		// Get account for billing cycle calculation
		const account = await prisma.expenseAccount.findUnique({
			where: { id: rest.accountId },
		});

		if (!account) {
			throw new Error("Account not found");
		}

		const tranDate = date ? new Date(date) : new Date();
		let billingCycle = "";

		if (account.type === "CREDIT_CARD") {
			billingCycle = getBilldingPeriodByDate(tranDate, account.dueDay!);
		} else {
			billingCycle = getBilldingPeriodByDate(tranDate, -1);
		}

		const transaction = await prisma.transaction.create({
			data: {
				...rest,
				date: tranDate,
				userId,
				type,
				billingCycle,
			},
		});

		// Handle tags
		if (tagIds && tagIds.length > 0) {
			await prisma.expenseTag.createMany({
				data: tagIds.map((tagId) => ({
					expenseId: transaction.id,
					transactionId: transaction.id,
					tagId,
				})),
			});
		}

		return await TransactionService.getById(transaction.id);
	}

	/**
	 * Create payment transaction
	 */
	static async createPayment(
		data: TransactionModel.CreatePayment,
		userId: string,
	) {
		const transaction = await prisma.transaction.create({
			data: {
				...data,
				date: new Date(),
				userId,
				type: "CC_PAYMENT",
			},
		});

		return await TransactionService.getById(transaction.id);
	}

	/**
	 * Update transaction
	 */
	static async update(id: string, data: TransactionModel.Update) {
		const { tagIds, date, ...rest } = data;

		await prisma.transaction.update({
			where: { id },
			data: {
				...rest,
				date: date ? new Date(date) : undefined,
			},
		});

		// Handle tags if provided
		if (tagIds !== undefined) {
			await prisma.expenseTag.deleteMany({ where: { expenseId: id } });
			if (tagIds.length > 0) {
				await prisma.expenseTag.createMany({
					data: tagIds.map((tagId) => ({
						expenseId: id,
						transactionId: id,
						tagId,
					})),
				});
			}
		}

		return await TransactionService.getById(id);
	}

	/**
	 * Update payment transaction
	 */
	static async updatePayment(id: string, data: TransactionModel.UpdatePayment) {
		await prisma.transaction.update({
			where: { id },
			data,
		});

		return await TransactionService.getById(id);
	}

	/**
	 * Delete transaction
	 */
	static async delete(id: string) {
		return await prisma.transaction.delete({
			where: { id },
		});
	}

	/**
	 * Verify transaction belongs to user
	 */
	static async verifyOwnership(id: string, userId: string): Promise<boolean> {
		const transaction = await prisma.transaction.findUnique({
			where: { id },
		});
		return transaction?.userId === userId;
	}

	/**
	 * Verify transaction is a payment
	 */
	static async isPayment(id: string): Promise<boolean> {
		const transaction = await prisma.transaction.findUnique({
			where: { id },
		});
		return transaction?.type === "CC_PAYMENT";
	}
}
