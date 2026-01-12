import { cron } from '@elysiajs/cron'
import { openapi } from "@elysiajs/openapi";
import { logger } from "@tqman/nice-logger";
import Elysia, { t } from "elysia";
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { authPlugin } from "./auth-plugin";
import { categories } from "./routes/categories";
import { expenseAccounts } from "./routes/expense-accounts";
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
	.use(
		cron({
			name: 'heartbeat',
			pattern: '*/10 * * * * *',
			async run() {
				// calculate balance
				const accounts = await prisma.expenseAccount.findMany({
				})
				for (const account of accounts) {
					if (account.type === "CREDIT_CARD") {
						//get all expenses
						const expenses = await prisma.transaction.aggregate({
							_sum: {
								amount: true
							},
							where: {
								accountId: account.id,
								type: "OUTFLOW"
							}
						})
						const payments = await prisma.transaction.aggregate({
							_sum: {
								amount: true
							},
							where: {
								accountId: account.id,
								type: "CC_PAYMENT"
							}
						})


					}
				}
			}
		})
	)


export default api;
