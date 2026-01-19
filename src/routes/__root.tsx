import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth-server";
import { useThemeStore } from "@/stores/useThemeStore";
import Header from "../components/Header";
import { LoadingSpinner } from "../components/LoadingSpinner";
import appCss from "../styles.css?url";
import "../registerSW";

const queryClient = new QueryClient();

export interface RouterContext {
	isAuthenticated: boolean;
	user?: {
		id?: string;
		email?: string;
		name?: string;
		image?: string | null;
		createdAt?: Date;
		updatedAt?: Date;
		emailVerified?: boolean;
	} | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({

	beforeLoad: async ({ location }) => {
		// Skip auth check for API routes
		if (location.pathname.startsWith("/api/")) {
			return {
				isAuthenticated: false,
				user: null,
			};
		}

		// Fetch auth data (cached via HTTP Cache-Control headers)
		const session = await getCurrentUser();

		return session;
	},

	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Personal Manager",
			},
			{
				name: "description",
				content: "Personal management application for organizing your life",
			},
			{
				name: "theme-color",
				content: "#000000",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "manifest",
				href: "/manifest.json",
			},
			{
				rel: "apple-touch-icon",
				href: "/logo192.png",
			},
		],
	}),

	pendingComponent: LoadingSpinner,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const theme = useThemeStore((state) => state.theme);

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

	return (
		<QueryClientProvider client={queryClient}>
			<html lang="en">
				<head>
					<HeadContent />
				</head>
				<body>
					<Header />
					{children}
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
					<Scripts />
				</body>
			</html>
		</QueryClientProvider>
	);
}
