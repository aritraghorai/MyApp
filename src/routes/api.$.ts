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

// Use VITE_API_URL if available, otherwise fall back to current origin
const getApiBaseURL = () => {
	const apiUrl = import.meta.env.VITE_API_URL;
	if (apiUrl && apiUrl !== "undefined") {
		return apiUrl;
	}
	// Fallback to current origin (only works on client-side)
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	// Server-side fallback
	return "";
};

export const getTreaty = createIsomorphicFn()
	.server(() => treaty(api).api)
	.client(() => treaty<typeof api>(getApiBaseURL()).api);
