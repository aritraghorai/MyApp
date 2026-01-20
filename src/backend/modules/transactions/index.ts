import { Elysia } from "elysia";
import { authPlugin } from "../../auth-plugin";
import { TransactionModel } from "./model";
import { TransactionService } from "./service";

/**
 * Transactions Controller
 * Following REST principles - using query parameters for filtering instead of custom endpoints
 */
export const transactions = new Elysia({ prefix: "/transactions" })
	.use(authPlugin)
	.model({
		"transaction.create": TransactionModel.create,
		"transaction.update": TransactionModel.update,
		"transaction.createPayment": TransactionModel.createPayment,
		"transaction.updatePayment": TransactionModel.updatePayment,
		"transaction.listQuery": TransactionModel.listQuery,
		"transaction.idParam": TransactionModel.idParam,
	})
	// GET /transactions - List transactions with filtering via query parameters
	.get(
		"/",
		async ({ query, user }) => {
			return await TransactionService.getAll(user.id, query);
		},
		{
			auth: true,
			query: "transaction.listQuery",
		},
	)
	// GET /transactions/:id - Get transaction by ID
	.get(
		"/:id",
		async ({ params: { id }, user, set }) => {
			const transaction = await TransactionService.getById(id);

			if (!transaction) {
				set.status = 404;
				return "Transaction not found";
			}

			if (transaction.userId !== user.id) {
				set.status = 403;
				return "Forbidden";
			}

			return transaction;
		},
		{
			auth: true,
			params: "transaction.idParam",
		},
	)
	// POST /transactions - Create transaction
	.post(
		"/",
		async ({ body, user, set }) => {
			try {
				return await TransactionService.create(body, user.id);
			} catch (error) {
				if (error instanceof Error && error.message === "Account not found") {
					set.status = 404;
					return error.message;
				}
				throw error;
			}
		},
		{
			auth: true,
			body: "transaction.create",
		},
	)
	// PATCH /transactions/:id - Update transaction
	.patch(
		"/:id",
		async ({ params: { id }, body, user, set }) => {
			const isOwner = await TransactionService.verifyOwnership(id, user.id);

			if (!isOwner) {
				const exists = await TransactionService.getById(id);
				if (!exists) {
					set.status = 404;
					return "Transaction not found";
				}
				set.status = 403;
				return "Forbidden";
			}

			try {
				return await TransactionService.update(id, body);
			} catch (_e) {
				set.status = 404;
				return "Transaction not found";
			}
		},
		{
			auth: true,
			params: "transaction.idParam",
			body: "transaction.update",
		},
	)
	// DELETE /transactions/:id - Delete transaction
	.delete(
		"/:id",
		async ({ params: { id }, user, set }) => {
			const isOwner = await TransactionService.verifyOwnership(id, user.id);

			if (!isOwner) {
				const exists = await TransactionService.getById(id);
				if (!exists) {
					set.status = 404;
					return "Transaction not found";
				}
				set.status = 403;
				return "Forbidden";
			}

			try {
				return await TransactionService.delete(id);
			} catch (_e) {
				set.status = 404;
				return "Transaction not found";
			}
		},
		{
			auth: true,
			params: "transaction.idParam",
		},
	)
	// POST /transactions/payment - Create payment transaction
	.post(
		"/payment",
		async ({ user, body }) => {
			return await TransactionService.createPayment(body, user.id);
		},
		{
			auth: true,
			body: "transaction.createPayment",
		},
	)
	// PATCH /transactions/payment/:id - Update payment transaction
	.patch(
		"/payment/:id",
		async ({ params: { id }, body, user, set }) => {
			const isOwner = await TransactionService.verifyOwnership(id, user.id);

			if (!isOwner) {
				const exists = await TransactionService.getById(id);
				if (!exists) {
					set.status = 404;
					return "Transaction not found";
				}
				set.status = 403;
				return "Forbidden";
			}

			const isPayment = await TransactionService.isPayment(id);
			if (!isPayment) {
				set.status = 400;
				return "Transaction is not a payment";
			}

			return await TransactionService.updatePayment(id, body);
		},
		{
			auth: true,
			params: "transaction.idParam",
			body: "transaction.updatePayment",
		},
	);
