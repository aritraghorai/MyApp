import { cron } from "@elysiajs/cron";
import { openapi } from "@elysiajs/openapi";
import { logger } from "@tqman/nice-logger";
import Elysia from "elysia";
import { auth } from "@/lib/auth";
// Import cron job (will be moved to modules/account-sync later)
import { prisma } from "@/lib/prisma";
import { authPlugin } from "./auth-plugin";
// Import refactored modules
import { categories } from "./modules/categories";
import { expenseAccounts } from "./modules/expense-accounts";
import { notes } from "./modules/notes";
import { people } from "./modules/people";
import { tags } from "./modules/tags";
import { transactions } from "./modules/transactions";

const api = new Elysia({
	prefix: "/api",
})
	.mount(auth.handler)
	.use(openapi())
	.use(
		logger({
			mode: "combined",
			withTimestamp: true,
			withBanner: true,
		}),
	)
	//log requests
	.onBeforeHandle(({ path, query }) => {
		console.log(`[ ${path}`);
		if (Object.keys(query).length) {
			console.log(`   Query: ${JSON.stringify(query)}`);
		}
	})
	.use(authPlugin)
	.get("/", () => {
		console.log(process.env);
		return "Hi";
	})
	.get("/user", ({ user }) => user, {
		auth: true,
	})
	// Refactored modules following REST principles
	.use(expenseAccounts)
	.use(transactions) // Now uses query parameters for filtering
	.use(tags)
	.use(people)
	.use(categories)
	.use(notes) // Consolidated notes module with all sub-resources
	.use(
		cron({
			name: "update-account-balances",
			pattern: "*/10 * * * *", // Run every 10 minutes
			async run() {
				console.log("🔄 Running account balance update cron job...");

				try {
					const accounts = await prisma.expenseAccount.findMany();

					for (const account of accounts) {
						let newBalance = 0;

						if (account.type === "CREDIT_CARD") {
							// For credit cards: balance = expenses - payments
							const expenses = await prisma.transaction.aggregate({
								_sum: {
									amount: true,
								},
								where: {
									accountId: account.id,
									type: "OUTFLOW",
								},
							});

							const payments = await prisma.transaction.aggregate({
								_sum: {
									amount: true,
								},
								where: {
									accountId: account.id,
									type: "CC_PAYMENT",
								},
							});

							const totalExpenses = expenses._sum.amount || 0;
							const totalPayments = payments._sum.amount || 0;
							newBalance = Number(totalExpenses) - Number(totalPayments);
						} else if (account.type === "BANK" || account.type === "CASH") {
							// For bank/cash: balance = income - outflows - payments made
							const income = await prisma.transaction.aggregate({
								_sum: {
									amount: true,
								},
								where: {
									accountId: account.id,
									type: "INCOME",
								},
							});

							const outflows = await prisma.transaction.aggregate({
								_sum: {
									amount: true,
								},
								where: {
									accountId: account.id,
									type: "OUTFLOW",
								},
							});

							const paymentsMade = await prisma.transaction.aggregate({
								_sum: {
									amount: true,
								},
								where: {
									fromAccountId: account.id,
									type: "CC_PAYMENT",
								},
							});

							const totalIncome = income._sum.amount || 0;
							const totalOutflows = outflows._sum.amount || 0;
							const totalPaymentsMade = paymentsMade._sum.amount || 0;
							newBalance =
								Number(totalIncome) -
								Number(totalOutflows) -
								Number(totalPaymentsMade);
						}

						// Update the account balance if it changed
						const currentBalance = Number(account.balance);
						if (currentBalance !== newBalance) {
							await prisma.expenseAccount.update({
								where: { id: account.id },
								data: { balance: newBalance },
							});
							console.log(
								`✅ Updated ${account.name} (${account.type}): ${currentBalance} → ${newBalance}`,
							);
						}
					}

					console.log("✅ Account balance update completed");
				} catch (error) {
					console.error("❌ Error updating account balances:", error);
				}
			},
		}),
	);

export default api;
