import { treaty } from "@elysiajs/eden";

import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import api from "@/backend";

const handle = ({ request }: { request: Request }) => api.fetch(request);

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});

export const getTreaty = createIsomorphicFn()
  .server(() => treaty(api).api)
  .client(() => treaty<typeof api>("localhost:3000").api);
