import Elysia, { t } from "elysia";
import { logger } from "@tqman/nice-logger";
import { expenseAccounts } from "./routes/expense-accounts";
import { transactions } from "./routes/transactions";
import { tags } from "./routes/tags";
import { people } from "./routes/people";
import { categories } from "./routes/categories";
import { openapi } from '@elysiajs/openapi'


import { authPlugin } from "./auth-plugin";
import { auth } from "@/lib/auth";

const api = new Elysia({
  prefix: "/api",
})
  .mount(auth.handler)
  .use(openapi())
  .use(logger({
    mode: "live", // "live" or "combined" (default: "combined")
    withTimestamp: true, // optional (default: false)
  }))
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
  .use(categories);

export default api;
