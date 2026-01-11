import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logo from "@/logo.svg";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

export default function Header() {
	const { isAuthenticated, logWithAuthelia, logout, isPending } = useAuth();
	return (
		<>
			<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur  container mx-auto">
				<div className="container flex h-14 max-w-screen-2xl items-center px-4">
					<div className="mr-4 flex">
						<Link to="/" className="mr-6 flex items-center space-x-2">
							<img src={logo} className="h-6 w-6" alt="Logo" />
							<span className="hidden font-bold sm:inline-block">My App</span>
						</Link>
						<nav className="flex items-center space-x-6 text-sm font-medium">
							<Link
								to="/expenses"
								className="transition-colors hover:text-foreground/80 text-foreground/60"
								activeProps={{ className: "text-foreground" }}
							>
								Expenses
							</Link>
						</nav>
					</div>
					<div className="flex flex-1 items-center justify-end space-x-2">
						<ThemeToggle />
						{isPending ? (
							<p className="text-sm text-muted-foreground">Loading...</p>
						) : (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									isAuthenticated ? logout() : logWithAuthelia();
								}}
							>
								{isAuthenticated ? (
									<>
										<LogOut className="mr-2 h-4 w-4" />
										Logout
									</>
								) : (
									"Login"
								)}
							</Button>
						)}
					</div>
				</div>
			</header>
		</>
	);
}
