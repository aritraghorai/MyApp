import { t } from "elysia";

/**
 * Transaction Models and Types
 * Following Elysia best practices and REST principles
 */
export namespace TransactionModel {
	// Transaction type enum
	export const transactionType = t.Enum({
		OUTFLOW: "OUTFLOW",
		INCOME: "INCOME",
		CC_PAYMENT: "CC_PAYMENT",
	});

	// Create transaction DTO
	export const create = t.Object({
		amount: t.Number(),
		type: t.Union([t.Literal("OUTFLOW"), t.Literal("INCOME")]),
		description: t.Optional(t.String()),
		date: t.Optional(t.String()), // ISO Date string
		categoryId: t.String(),
		accountId: t.String(),
		destinationAccountId: t.Optional(t.String()),
		personId: t.String(),
		tagIds: t.Optional(t.Array(t.String())),
	});

	export type Create = typeof create.static;

	// Create payment transaction DTO
	export const createPayment = t.Object({
		amount: t.Number(),
		categoryId: t.String(),
		accountId: t.String(),
		fromAccountId: t.String(),
		billingCycle: t.String(),
		personId: t.String(),
	});

	export type CreatePayment = typeof createPayment.static;

	// Update transaction DTO
	export const update = t.Partial(
		t.Object({
			amount: t.Number(),
			type: transactionType,
			description: t.Optional(t.String()),
			date: t.Optional(t.String()),
			categoryId: t.String(),
			accountId: t.String(),
			destinationAccountId: t.Optional(t.String()),
			personId: t.String(),
			tagIds: t.Optional(t.Array(t.String())),
		}),
	);

	export type Update = typeof update.static;

	// Update payment DTO
	export const updatePayment = t.Partial(
		t.Object({
			amount: t.Number(),
			categoryId: t.String(),
			accountId: t.String(),
			fromAccountId: t.String(),
			billingCycle: t.String(),
			personId: t.String(),
		}),
	);

	export type UpdatePayment = typeof updatePayment.static;

	// Query parameters for filtering (REST principle)
	export const listQuery = t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		accountId: t.Optional(t.String()),
		categoryId: t.Optional(t.String()),
		personId: t.Optional(t.String()),
		fromDate: t.Optional(t.String()),
		toDate: t.Optional(t.String()),
		billingCycle: t.Optional(t.String()), // REST: query param instead of /by-cycle endpoint
	});

	export type ListQuery = typeof listQuery.static;

	// ID param
	export const idParam = t.Object({
		id: t.String(),
	});

	export type IdParam = typeof idParam.static;
}
