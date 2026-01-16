import { cron } from '@elysiajs/cron'
import { openapi } from "@elysiajs/openapi";
import { logger } from "@tqman/nice-logger";
import Elysia, { t } from "elysia";
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { authPlugin } from "./auth-plugin";
import { categories } from "./routes/categories";
import { expenseAccounts } from "./routes/expense-accounts";
import { noteHabits } from "./routes/note-habits";
import { noteSearch } from "./routes/note-search";
import { noteTags } from "./routes/note-tags";
import { noteTemplates } from "./routes/note-templates";
import { noteTodos } from "./routes/note-todos";
import { notes } from "./routes/notes";
import { people } from "./routes/people";
import { tags } from "./routes/tags";
import { transactions } from "./routes/transactions";


const api = new Elysia({
	prefix: "/api",
})
	.mount(auth.handler)
	.use(openapi())
	.use(
		logger({
			mode: "combined", // "live" or "combined" (default: "combined")
			withTimestamp: true, // optional (default: false)
			withBanner: true, // optional (default: false)
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
	.get("/greet/:name", ({ params }) => `Hello, ${params.name}!`, {
		params: t.Object({
			name: t.String(),
		}),
	})
	.get("/user", ({ user }) => user, {
		auth: true,
	})
	.use(expenseAccounts)
	.use(transactions)
	.use(tags)
	.use(people)
	.use(categories)
	.use(notes)
	.use(noteTags)
	.use(noteTemplates)
	.use(noteHabits)
	.use(noteTodos)
	.use(noteSearch)
	.use(
		cron({
			name: 'update-account-balances',
			pattern: '*/10 * * * *', // Run every 10 minutes
			async run() {
				console.log('🔄 Running account balance update cron job...');

				try {
					const accounts = await prisma.expenseAccount.findMany();

					for (const account of accounts) {
						let newBalance = 0;

						if (account.type === "CREDIT_CARD") {
							// For credit cards: balance = expenses - payments
							// Get all expenses (OUTFLOW transactions)
							const expenses = await prisma.transaction.aggregate({
								_sum: {
									amount: true
								},
								where: {
									accountId: account.id,
									type: "OUTFLOW"
								}
							});

							// Get all payments (CC_PAYMENT transactions where this card is the destination)
							const payments = await prisma.transaction.aggregate({
								_sum: {
									amount: true
								},
								where: {
									accountId: account.id,
									type: "CC_PAYMENT"
								}
							});

							// Credit card balance = total expenses - total payments
							const totalExpenses = expenses._sum.amount || 0;
							const totalPayments = payments._sum.amount || 0;
							newBalance = Number(totalExpenses) - Number(totalPayments);

						} else if (account.type === "BANK" || account.type === "CASH") {
							// For bank/cash: balance = income - outflows - payments made
							// Get all income
							const income = await prisma.transaction.aggregate({
								_sum: {
									amount: true
								},
								where: {
									accountId: account.id,
									type: "INCOME"
								}
							});

							// Get all outflows (spending from this account)
							const outflows = await prisma.transaction.aggregate({
								_sum: {
									amount: true
								},
								where: {
									accountId: account.id,
									type: "OUTFLOW"
								}
							});

							// Get all payments made FROM this account (CC_PAYMENT where fromAccountId is this account)
							const paymentsMade = await prisma.transaction.aggregate({
								_sum: {
									amount: true
								},
								where: {
									fromAccountId: account.id,
									type: "CC_PAYMENT"
								}
							});

							// Bank/Cash balance = income - outflows - payments made
							const totalIncome = income._sum.amount || 0;
							const totalOutflows = outflows._sum.amount || 0;
							const totalPaymentsMade = paymentsMade._sum.amount || 0;
							newBalance = Number(totalIncome) - Number(totalOutflows) - Number(totalPaymentsMade);
						}

						// Update the account balance if it changed
						const currentBalance = Number(account.balance);
						if (currentBalance !== newBalance) {
							await prisma.expenseAccount.update({
								where: { id: account.id },
								data: { balance: newBalance }
							});
							console.log(`✅ Updated ${account.name} (${account.type}): ${currentBalance} → ${newBalance}`);
						}
					}

					console.log('✅ Account balance update completed');
				} catch (error) {
					console.error('❌ Error updating account balances:', error);
				}
			}
		})
	)


export default api;
