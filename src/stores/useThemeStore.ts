import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

// Get system preference
const getSystemTheme = (): Theme => {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: getSystemTheme(),
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
		}),
		{
			name: "theme-storage",
		},
	),
);
