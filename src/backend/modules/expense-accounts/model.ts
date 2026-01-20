import { t } from "elysia";

/**
 * Expense Account Models and Types
 * Following Elysia best practices - models are the single source of truth
 */
export namespace ExpenseAccountModel {
	// Account type enum
	export const accountType = t.Enum({
		CASH: "CASH",
		BANK: "BANK",
		CREDIT_CARD: "CREDIT_CARD",
	});

	// Create account DTO
	export const create = t.Object({
		name: t.String(),
		type: accountType,
		balance: t.Number(),
		limit: t.Optional(t.Number()),
		closingDay: t.Optional(t.Number()),
		dueDay: t.Optional(t.Number()),
	});

	export type Create = typeof create.static;

	// Update account DTO
	export const update = t.Partial(create);

	export type Update = typeof update.static;

	// ID param
	export const idParam = t.Object({
		id: t.String(),
	});

	export type IdParam = typeof idParam.static;
}
