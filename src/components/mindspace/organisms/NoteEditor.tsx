import MDEditor from "@uiw/react-md-editor";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { MarkdownToolbar } from "../molecules/MarkdownToolbar";

interface NoteEditorProps {
    content: string;
    onContentChange: (content: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    isLoading: boolean;
    theme: "light" | "dark";
    onShowShortcuts: () => void;
}

/**
 * Organism: Complete markdown editor with toolbar
 */
export const NoteEditor = ({
    content,
    onContentChange,
    onFocus,
    onBlur,
    isLoading,
    theme,
    onShowShortcuts,
}: NoteEditorProps) => {
    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {isLoading ? (
                <LoadingSpinner message="Loading note..." />
            ) : (
                <div data-color-mode={theme}>
                    <MarkdownToolbar
                        onInsert={(markdown) => {
                            const newContent = `${content}\n${markdown}`;
                            onContentChange(newContent);
                        }}
                        onShowShortcuts={onShowShortcuts}
                    />
                    <MDEditor
                        value={content}
                        onChange={(val) => onContentChange(val || "")}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        height={600}
                        preview="live"
                        className="!border-0"
                    />
                </div>
            )}
        </div>
    );
};
