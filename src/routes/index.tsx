import { createFileRoute } from "@tanstack/react-router";
import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { isAuthenticated, isPending } = useAuth();

	if (isPending) {
		return <Loading />;
	}

	if (!isAuthenticated) {
		return <LoginPage />;
	}

	return (
		<div className="container">
			<Home />
		</div>
	);
}

function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
		</div>
	);
}

function LoginPage() {
	const { logWithAuthelia } = useAuth();

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-full max-w-md mx-4">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
					<CardDescription>Please sign in to continue</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Button onClick={logWithAuthelia} className="w-full" size="lg">
						Sign in with Authelia
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

function Home() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-4">
			<Card>
				<CardHeader>
					<CardTitle>Credit Card Expense Tracker</CardTitle>
					<CardDescription>Track All Credit Card Expenses</CardDescription>
				</CardHeader>
				<CardFooter>
					<Link to="/expense-tracker">
						<Button>Open</Button>
					</Link>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
				</CardHeader>
				<CardContent>
					<p>Card Content</p>
				</CardContent>
				<CardFooter>
					<p>Card Footer</p>
				</CardFooter>
			</Card>
		</div>
	);
}
