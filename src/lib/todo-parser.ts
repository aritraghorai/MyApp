/**
 * Todo Parser Utility
 * Parses markdown checkboxes and extracts todo items with metadata
 */

export interface ParsedTodo {
    content: string;
    completed: boolean;
    priority: "LOW" | "MEDIUM" | "HIGH";
    position: number;
    rawLine: string;
}

/**
 * Parse todos from markdown content
 * Supports:
 * - [ ] Uncompleted todo
 * - [x] Completed todo
 * - [ ] Todo with #high, #medium, #low priority tags
 */
export function parseTodos(markdown: string): ParsedTodo[] {
    const lines = markdown.split("\n");
    const todos: ParsedTodo[] = [];
    let position = 0;

    const todoRegex = /^(\s*)[-*]\s+\[([ xX])\]\s+(.+)$/;

    for (const line of lines) {
        const match = line.match(todoRegex);
        if (match) {
            const [, , checkbox, content] = match;
            const completed = checkbox.toLowerCase() === "x";
            const priority = detectPriority(content);

            // Remove priority tags from content for cleaner display
            const cleanContent = content
                .replace(/#high/gi, "")
                .replace(/#medium/gi, "")
                .replace(/#low/gi, "")
                .trim();

            todos.push({
                content: cleanContent,
                completed,
                priority,
                position: position++,
                rawLine: line,
            });
        }
    }

    return todos;
}

/**
 * Detect priority from todo content
 * Looks for #high, #medium, #low tags (case insensitive)
 */
export function detectPriority(text: string): "LOW" | "MEDIUM" | "HIGH" {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("#high")) {
        return "HIGH";
    }
    if (lowerText.includes("#low")) {
        return "LOW";
    }
    // Default to MEDIUM if no priority tag or if #medium is specified
    return "MEDIUM";
}

/**
 * Update todo checkbox state in markdown
 */
export function updateTodoInMarkdown(
    markdown: string,
    todoContent: string,
    completed: boolean
): string {
    const lines = markdown.split("\n");
    const checkbox = completed ? "[x]" : "[ ]";

    return lines
        .map((line) => {
            // Match the todo line by content
            if (line.includes(todoContent)) {
                return line.replace(/\[([ xX])\]/, checkbox);
            }
            return line;
        })
        .join("\n");
}

/**
 * Calculate word count from markdown content
 */
export function calculateWordCount(content: string): number {
    // Remove markdown syntax for more accurate count
    const plainText = content
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks
        .replace(/`[^`]+`/g, "") // Remove inline code
        .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Keep link text only
        .replace(/[#*_~`]/g, "") // Remove markdown symbols
        .trim();

    if (!plainText) return 0;

    return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Extract inline tags from content (e.g., #work, #personal)
 * Returns unique tags found in the content
 */
export function extractInlineTags(content: string): string[] {
    const tagRegex = /#([a-zA-Z0-9_-]+)/g;
    const tags = new Set<string>();

    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        const tag = match[1].toLowerCase();
        // Exclude priority tags
        if (!["high", "medium", "low"].includes(tag)) {
            tags.add(tag);
        }
    }

    return Array.from(tags);
}
