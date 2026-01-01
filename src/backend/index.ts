import { auth } from "@/lib/auth";
import Elysia, { t } from "elysia";

const api = new Elysia({
  prefix: "/api",
})
  .mount(auth.handler)
  .get("/", () => {
    console.log(process.env);
    return "Hi";
  })
  .get("/greet/:name", ({ params }) => `Hello, ${params.name}!`, {
    params: t.Object({
      name: t.String(),
    }),
  });

export default api;
