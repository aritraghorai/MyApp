import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/useThemeStore";
import { Button } from "./ui/button";

export default function ThemeToggle() {
	const { theme, toggleTheme } = useThemeStore();

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			{theme === "light" ? (
				<Moon className="h-4 w-4" />
			) : (
				<Sun className="h-4 w-4" />
			)}
		</Button>
	);
}
