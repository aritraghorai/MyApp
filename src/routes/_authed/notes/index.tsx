import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/notes/")({
	beforeLoad: () => {
		throw redirect({
			to: "/notes/journal",
		});
	},
});
