import { Elysia } from "elysia";
import { authPlugin } from "../../auth-plugin";
import { ExpenseAccountModel } from "./model";
import { ExpenseAccountService } from "./service";

/**
 * Expense Accounts Controller
 * Handles HTTP routing and request validation
 * Following REST principles and Elysia best practices
 */
export const expenseAccounts = new Elysia({ prefix: "/expense-accounts" })
	.use(authPlugin)
	.model({
		"expenseAccount.create": ExpenseAccountModel.create,
		"expenseAccount.update": ExpenseAccountModel.update,
		"expenseAccount.idParam": ExpenseAccountModel.idParam,
	})
	// GET /expense-accounts - List all accounts
	.get(
		"/",
		async ({ user }) => {
			return await ExpenseAccountService.getAll(user.id);
		},
		{
			auth: true,
		},
	)
	// GET /expense-accounts/:id - Get account by ID
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const account = await ExpenseAccountService.getById(id);

			if (!account) {
				set.status = 404;
				return "Account not found";
			}

			return account;
		},
		{
			auth: true,
			params: "expenseAccount.idParam",
		},
	)
	// POST /expense-accounts - Create account
	.post(
		"/",
		async ({ body, user }) => {
			return await ExpenseAccountService.create(body, user.id);
		},
		{
			auth: true,
			body: "expenseAccount.create",
		},
	)
	// PATCH /expense-accounts/:id - Update account
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				return await ExpenseAccountService.update(id, body);
			} catch (_e) {
				set.status = 404;
				return "Account not found";
			}
		},
		{
			auth: true,
			params: "expenseAccount.idParam",
			body: "expenseAccount.update",
		},
	)
	// DELETE /expense-accounts/:id - Delete account
	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			try {
				return await ExpenseAccountService.delete(id);
			} catch (_e) {
				set.status = 404;
				return "Account not found";
			}
		},
		{
			auth: true,
			params: "expenseAccount.idParam",
		},
	);
