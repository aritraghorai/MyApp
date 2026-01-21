export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TodoBase {
    id: string;
    content: string;
    completed: boolean;
    priority: TodoPriority;
    position: number;
}

export interface Todo extends TodoBase {
    noteId: string;
    note?: {
        date: string;
    };
}

export type TodoFilter = "all" | "active" | "completed";

export const PRIORITY_COLORS: Record<TodoPriority, string> = {
    HIGH: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    MEDIUM: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    LOW: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
};

export const PRIORITY_COLORS_BORDER: Record<TodoPriority, string> = {
    HIGH: "text-red-600 dark:text-red-400 border-red-300 dark:border-red-700",
    MEDIUM: "text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
    LOW: "text-green-600 dark:text-green-400 border-green-300 dark:border-green-700",
};

export const PRIORITY_BADGES: Record<TodoPriority, string> = {
    HIGH: "bg-red-600 dark:bg-red-500 text-white",
    MEDIUM: "bg-yellow-600 dark:bg-yellow-500 text-white",
    LOW: "bg-green-600 dark:bg-green-500 text-white",
};

export const PRIORITY_BADGES_LIGHT: Record<TodoPriority, string> = {
    HIGH: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    MEDIUM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    LOW: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};
