import {
    Bold,
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Image,
    Italic,
    Keyboard,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownToolbarProps {
    onInsert: (markdown: string) => void;
    onShowShortcuts: () => void;
}

export function MarkdownToolbar({ onInsert, onShowShortcuts }: MarkdownToolbarProps) {
    const tools = [
        { icon: Bold, label: "Bold", markdown: "**text**", shortcut: "Ctrl+B" },
        { icon: Italic, label: "Italic", markdown: "*text*", shortcut: "Ctrl+I" },
        { icon: Heading1, label: "Heading 1", markdown: "# ", shortcut: "Ctrl+1" },
        { icon: Heading2, label: "Heading 2", markdown: "## ", shortcut: "Ctrl+2" },
        { icon: Heading3, label: "Heading 3", markdown: "### ", shortcut: "Ctrl+3" },
        { icon: List, label: "Bullet List", markdown: "- ", shortcut: "Ctrl+L" },
        { icon: ListOrdered, label: "Numbered List", markdown: "1. ", shortcut: "Ctrl+Shift+L" },
        { icon: CheckSquare, label: "Todo", markdown: "- [ ] ", shortcut: "" },
        { icon: Quote, label: "Quote", markdown: "> ", shortcut: "Ctrl+Q" },
        { icon: Code, label: "Code Block", markdown: "```\ncode\n```", shortcut: "Ctrl+K" },
        { icon: LinkIcon, label: "Link", markdown: "[text](url)", shortcut: "Ctrl+Shift+K" },
        { icon: Image, label: "Image", markdown: "![alt](url)", shortcut: "" },
        { icon: Table, label: "Table", markdown: "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |", shortcut: "" },
    ];

    return (
        <TooltipProvider>
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                {tools.map((tool) => (
                    <Tooltip key={tool.label}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onInsert(tool.markdown)}
                                className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                            >
                                <tool.icon size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-medium">{tool.label}</p>
                            {tool.shortcut && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{tool.shortcut}</p>
                            )}
                        </TooltipContent>
                    </Tooltip>
                ))}

                <div className="ml-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onShowShortcuts}
                                className="h-8 gap-1.5 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/20"
                            >
                                <Keyboard size={14} />
                                <span className="hidden sm:inline">Shortcuts</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View all keyboard shortcuts</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
