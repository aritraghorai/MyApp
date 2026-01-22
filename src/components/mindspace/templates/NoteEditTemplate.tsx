import { History } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SaveStatus, SidebarView } from "@/types/mindspace/view.types";
import { MoodSelector } from "../molecules/MoodSelector";
import { NoteEditor } from "../organisms/NoteEditor";
import { NoteSidebar } from "../organisms/NoteSidebar";
import { TemplatePicker } from "../organisms/TemplatePicker";
import { TipsSection } from "../organisms/TipsSection";

interface NoteEditTemplateProps {
    // Mood props
    mood: number | null;
    onMoodChange: (mood: number | null) => void;

    // Editor props
    content: string;
    onContentChange: (content: string) => void;
    onEditorFocus?: () => void;
    onEditorBlur?: () => void;
    isLoading: boolean;
    theme: "light" | "dark";
    onShowShortcuts: () => void;

    // Template props
    selectedDate: Date;
    onTemplateApply: (content: string) => void;

    // History props
    hasNote: boolean;
    onShowHistory: () => void;

    // Sidebar props
    noteId: string | null;
    noteDate: string;
    onTodoChange: () => void;
}

/**
 * Template: Layout for note editing view (Content Only - No Header)
 */
export const NoteEditTemplate = ({
    selectedDate,
    mood,
    onMoodChange,
    content,
    onContentChange,
    onEditorFocus,
    onEditorBlur,
    isLoading,
    theme,
    onShowShortcuts,
    onTemplateApply,
    hasNote,
    onShowHistory,
    noteId,
    noteDate,
    onTodoChange,
}: NoteEditTemplateProps) => {
    const [sidebarView, setSidebarView] = useState<SidebarView>("todos");
    const showSidebar = true;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 md:gap-6">
            {/* Main Content */}
            <div className="space-y-4 md:space-y-6">

                {/* Template and History Actions */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                    <div className="flex items-center justify-end gap-2">
                        <TemplatePicker
                            currentDate={selectedDate}
                            onApplyTemplate={onTemplateApply}
                        />
                        {hasNote && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onShowHistory}
                                className="gap-2"
                            >
                                <History size={16} />
                                <span className="hidden sm:inline">History</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mood Selector */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                    <MoodSelector value={mood} onChange={onMoodChange} />
                </div>

                {/* Editor */}
                <NoteEditor
                    content={content}
                    onContentChange={onContentChange}
                    onFocus={onEditorFocus}
                    onBlur={onEditorBlur}
                    isLoading={isLoading}
                    theme={theme}
                    onShowShortcuts={onShowShortcuts}
                />

                {/* Tips */}
                <TipsSection />
            </div>

            {/* Sidebar */}
            {showSidebar && (
                <NoteSidebar
                    sidebarView={sidebarView}
                    onSidebarViewChange={setSidebarView}
                    noteId={noteId}
                    noteContent={content}
                    noteDate={noteDate}
                    selectedDate={selectedDate}
                    onTodoChange={onTodoChange}
                />
            )}
        </div>
    );
};
