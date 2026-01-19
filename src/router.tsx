import { createRouter } from "@tanstack/react-router";
import { LoadingSpinner } from "./components/LoadingSpinner";
import type { RouterContext } from "./routes/__root";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPendingComponent: LoadingSpinner,
		context: {
			isAuthenticated: false,
			user: null,
		} satisfies RouterContext,
	});

	return router;
};
