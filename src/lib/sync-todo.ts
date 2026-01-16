import { updateTodoInMarkdown } from "@/lib/todo-parser";

interface SyncTodoToMarkdownParams {
    noteId: string;
    todoContent: string;
    completed: boolean;
    currentMarkdown: string;
}

/**
 * Syncs a todo change back to the note's markdown content
 */
export async function syncTodoToMarkdown({
    noteId,
    todoContent,
    completed,
    currentMarkdown,
}: SyncTodoToMarkdownParams): Promise<{ success: boolean; error?: string }> {
    try {
        // Update the markdown with the new todo state
        const updatedMarkdown = updateTodoInMarkdown(currentMarkdown, todoContent, completed);

        // Save the updated markdown back to the note
        const response = await fetch(`/api/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                date: new Date().toISOString().split("T")[0], // Will be replaced with actual note date
                content: updatedMarkdown,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update note");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to sync todo to markdown:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
