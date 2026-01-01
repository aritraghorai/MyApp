import { auth } from "@/lib/auth";
import Elysia, { t } from "elysia";
import { logger } from "@tqman/nice-logger";

const api = new Elysia({
  prefix: "/api",
})
  .use(logger({
    mode: "live", // "live" or "combined" (default: "combined")
    withTimestamp: true, // optional (default: false)
  }))
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers
        })
        if (!session) return status(401)

        return {
          user: session.user,
          session: session.session
        }
      }
    }
  })
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

export default api;
