import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { authMiddleware } from "./auth-middleware";

export const getCurrentUser = createServerFn({ method: "GET", })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		// Set response headers (e.g., for caching)
		setResponseHeaders(
			new Headers({
				'Cache-Control': 'public, max-age=300',
				'CDN-Cache-Control': 'max-age=3600, stale-while-revalidate=600',
			}),
		)

		return context;
	});
