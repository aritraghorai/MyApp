import { Link } from "@tanstack/react-router";
import { LogOut, Sparkles } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Text } from "./ui/Text";

export default function Header() {
	const { isAuthenticated, logWithAuthelia, logout, isPending } = useAuth();
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-6 mx-auto">
				{/* Logo and Brand */}
				<div className="mr-6 md:mr-8 flex">
					<Link to="/" className="flex items-center space-x-3 group">
						<div className="relative">
							<div className="relative bg-primary/10 p-1.5 rounded-lg border border-primary/20 group-hover:border-primary/40 transition-colors">
								<img
									src="/app-icon.png"
									className="h-6 w-6 rounded"
									alt="Logo"
								/>
							</div>
						</div>
						<div className="flex flex-col">
							<Text
								as="span"
								size="lg"
								weight="bold"
								variant="primary"
								className="hidden sm:inline-block"
							>
								My App
							</Text>
							<Text
								as="span"
								size="xs"
								variant="muted"
								weight="medium"
								className="hidden sm:inline-block -mt-1"
							>
								Personal Manager
							</Text>
						</div>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="hidden md:flex items-center space-x-1">
					<Link
						to="/expenses"
						className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
						activeProps={{
							className: "bg-accent text-accent-foreground",
						}}
					>
						<Text as="span" size="sm" weight="medium">
							Expenses
						</Text>
					</Link>
					<Link
						to="/notes"
						className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
						activeProps={{
							className: "bg-accent text-accent-foreground",
						}}
					>
						<Text as="span" size="sm" weight="medium">
							Mindspace
						</Text>
					</Link>
				</nav>

				{/* Right Side Actions */}
				<div className="flex flex-1 items-center justify-end space-x-2 md:space-x-3">
					{/* Mobile Navigation */}
					<nav className="flex md:hidden items-center space-x-1">
						<Link
							to="/expenses"
							className="px-3 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
							activeProps={{
								className: "bg-accent text-accent-foreground",
							}}
						>
							Expenses
						</Link>
						<Link
							to="/notes"
							className="px-3 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
							activeProps={{
								className: "bg-accent text-accent-foreground",
							}}
						>
							Mindspace
						</Link>
					</nav>

					<ThemeToggle />

					{isPending ? (
						<div className="flex items-center gap-2 px-3 py-1.5">
							<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							<Text
								as="p"
								size="sm"
								variant="muted"
								className="hidden sm:inline"
							>
								Loading...
							</Text>
						</div>
					) : (
						<Button
							variant={isAuthenticated ? "ghost" : "default"}
							size="sm"
							onClick={() => {
								isAuthenticated ? logout() : logWithAuthelia();
							}}
							className={
								isAuthenticated
									? "hover:bg-destructive/10 hover:text-destructive transition-colors"
									: ""
							}
						>
							{isAuthenticated ? (
								<>
									<LogOut className="h-4 w-4 sm:mr-2" />
									<span className="hidden sm:inline">Logout</span>
								</>
							) : (
								<>
									<Sparkles className="h-4 w-4 sm:mr-2" />
									<span className="hidden sm:inline">Login</span>
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
