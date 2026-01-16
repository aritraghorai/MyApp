import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import MDEditor from "@uiw/react-md-editor";
import { addDays, format, subDays } from "date-fns";
import {
    Calendar as CalendarIcon,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    FileText,
    History,
    List,
    RotateCcw,
    Save,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useThemeStore } from "@/stores/useThemeStore";
import { getTreaty } from "../../api.$";
import { AllTodos } from "./components/-AllTodos";
import { Analytics } from "./components/-Analytics";
import { HabitsView } from "./components/-HabitsView";
import { HabitTracker } from "./components/-HabitTracker";
import { KeyboardShortcutsDialog } from "./components/-KeyboardShortcutsDialog";
import { MarkdownToolbar } from "./components/-MarkdownToolbar";
import { MoodSelector } from "./components/-MoodSelector";
import { TemplatePicker } from "./components/-TemplatePicker";
import { TodoDashboard } from "./components/-TodoDashboard";

export const Route = createFileRoute("/_authed/notes/")({
    component: RouteComponent,
});

type ViewMode = "note" | "list" | "habits" | "todos";
type SidebarView = "todos" | "habits" | "info";

function RouteComponent() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [content, setContent] = useState("");
    const [mood, setMood] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [showHistory, setShowHistory] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("note");
    const [sidebarView, setSidebarView] = useState<SidebarView>("todos");
    const templateAppliedRef = useRef(false);
    const isEditingRef = useRef(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const queryClient = useQueryClient();
    const theme = useThemeStore((state) => state.theme);

    const dateString = format(selectedDate, "yyyy-MM-dd");

    // Fetch note for selected date
    const { data: note, isLoading } = useQuery({
        queryKey: ["note", dateString],
        queryFn: async () => {
            const { data, error } = await getTreaty().notes.get({
                query: { date: dateString },
            });
            if (error) throw error;
            return data;
        },
        refetchOnWindowFocus: false, // Prevent refetch during editing
    });

    // Fetch recent notes for list view
    const { data: recentNotes } = useQuery({
        queryKey: ["notes-range"],
        queryFn: async () => {
            const to = format(new Date(), "yyyy-MM-dd");
            const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
            const { data, error } = await getTreaty().notes.range.get({
                query: { from, to },
            });
            if (error) throw error;
            return data;
        },
        enabled: viewMode === "list",
    });

    // Fetch history for current note
    const { data: history, refetch: refetchHistory } = useQuery({
        queryKey: ["note-history", note && "id" in note ? note.id : null],
        queryFn: async () => {
            if (!note || !("id" in note)) return [];
            const response = await fetch(`/api/notes/${note.id}/history`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch history");
            return await response.json();
        },
        enabled: !!(note && "id" in note) && showHistory,
    });

    // Update content and mood when note changes
    useEffect(() => {
        // Don't overwrite content if a template was just applied
        if (templateAppliedRef.current) {
            templateAppliedRef.current = false;
            return;
        }

        // Don't overwrite content if user is actively editing
        if (isEditingRef.current) {
            return;
        }

        if (note && typeof note === "object" && "content" in note) {
            setContent(note.content as string);
            setMood((note as any).mood || null);
        } else {
            setContent("");
            setMood(null);
        }
    }, [note]);

    const handleSave = useCallback(async () => {
        if (!content.trim() && mood === null) return;

        setIsSaving(true);
        setSaveStatus("saving");
        try {
            const { error } = await getTreaty().notes.post({
                date: dateString,
                content: content || "",
                mood: mood || undefined,
            });
            if (error) {
                alert("Failed to save note");
                setSaveStatus("idle");
                return;
            }
            // Don't invalidate queries immediately to prevent disrupting editing
            // The data will be fresh on next load
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } finally {
            setIsSaving(false);
        }
    }, [content, mood, dateString]);

    // Auto-save with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            const noteContent = note && typeof note === "object" && "content" in note ? note.content : "";
            const noteMood = note && typeof note === "object" && "mood" in note ? (note as any).mood : null;

            if (content !== noteContent || mood !== noteMood) {
                await handleSave();
            }
        }, 1500); // Increased debounce time for better UX

        return () => clearTimeout(timer);
    }, [content, mood, note, handleSave]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setCalendarOpen(false);
            setShowHistory(false);
        }
    };

    const handlePrevDay = () => {
        setSelectedDate((prev) => subDays(prev, 1));
    };

    const handleNextDay = () => {
        setSelectedDate((prev) => addDays(prev, 1));
    };

    const handleRestore = async (historyId: string) => {
        if (!note || !("id" in note)) return;

        if (
            !confirm(
                "Are you sure you want to restore this version? Your current content will be saved to history."
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/notes/${note.id}/restore/${historyId}`, {
                method: "POST",
                credentials: "include",
            });
            if (!response.ok) {
                alert("Failed to restore version");
                return;
            }
            queryClient.invalidateQueries({ queryKey: ["note", dateString] });
            refetchHistory();
            setShowHistory(false);
        } catch {
            alert("Failed to restore version");
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const truncateContent = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const noteId = note && typeof note === "object" && "id" in note ? (note as any).id : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-[1800px] mx-auto p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 md:gap-6">
                    {/* Main Content */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Header with Navigation */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                            <div className="flex flex-col gap-4">
                                {/* Title and View Toggle */}
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                                        <Sparkles size={28} />
                                        Mindspace
                                    </h1>

                                    {/* View Mode Toggle */}
                                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <Button
                                            size="sm"
                                            variant={viewMode === "note" ? "default" : "ghost"}
                                            onClick={() => setViewMode("note")}
                                            className="gap-2"
                                        >
                                            <FileText size={16} />
                                            <span className="hidden sm:inline">Note</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={viewMode === "list" ? "default" : "ghost"}
                                            onClick={() => setViewMode("list")}
                                            className="gap-2"
                                        >
                                            <List size={16} />
                                            <span className="hidden sm:inline">List</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={viewMode === "todos" ? "default" : "ghost"}
                                            onClick={() => setViewMode("todos")}
                                            className="gap-2"
                                        >
                                            <CheckSquare size={16} />
                                            <span className="hidden sm:inline">Tasks</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={viewMode === "habits" ? "default" : "ghost"}
                                            onClick={() => setViewMode("habits")}
                                            className="gap-2"
                                        >
                                            <TrendingUp size={16} />
                                            <span className="hidden sm:inline">Habits</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Date Navigation */}
                                {viewMode === "note" && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                        {/* Date picker with prev/next arrows */}
                                        <div className="flex items-center gap-2 flex-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handlePrevDay}
                                                className="shrink-0"
                                            >
                                                <ChevronLeft size={20} />
                                            </Button>

                                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 sm:flex-initial sm:min-w-[240px] justify-start text-left font-normal"
                                                    >
                                                        <CalendarIcon className="mr-2 shrink-0" size={16} />
                                                        <span className="truncate hidden sm:inline">
                                                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                                                        </span>
                                                        <span className="truncate sm:hidden">
                                                            {format(selectedDate, "EEE, MMM d, yyyy")}
                                                        </span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="center">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={handleDateSelect}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleNextDay}
                                                className="shrink-0"
                                            >
                                                <ChevronRight size={20} />
                                            </Button>
                                        </div>

                                        {/* Template and History buttons */}
                                        <div className="flex items-center gap-2">
                                            <TemplatePicker
                                                currentDate={selectedDate}
                                                onApplyTemplate={(templateContent) => {
                                                    templateAppliedRef.current = true;
                                                    setContent(templateContent);
                                                    setViewMode("note");
                                                }}
                                            />
                                            {note && "id" in note && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowHistory(true)}
                                                    className="gap-2"
                                                >
                                                    <History size={16} />
                                                    <span className="hidden sm:inline">History</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Saving Indicator */}
                                {viewMode === "note" && saveStatus !== "idle" && (
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        {saveStatus === "saving" ? (
                                            <>
                                                <Save size={16} className="animate-pulse text-purple-500" />
                                                <span className="text-purple-600 dark:text-purple-400">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} className="text-green-500" />
                                                <span className="text-green-600 dark:text-green-400">Saved</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mood Selector */}
                        {viewMode === "note" && (
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                                <MoodSelector value={mood} onChange={setMood} />
                            </div>
                        )}

                        {/* Content Area */}
                        {viewMode === "note" ? (
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                                {isLoading ? (
                                    <div className="p-12 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                                            Loading note...
                                        </p>
                                    </div>
                                ) : (
                                    <div data-color-mode={theme}>
                                        <MarkdownToolbar
                                            onInsert={(markdown) => {
                                                const newContent = content + "\n" + markdown;
                                                setContent(newContent);
                                            }}
                                            onShowShortcuts={() => setShowShortcuts(true)}
                                        />
                                        <MDEditor
                                            value={content}
                                            onChange={(val) => {
                                                isEditingRef.current = true;
                                                setContent(val || "");
                                                // Reset editing flag after a delay
                                                setTimeout(() => {
                                                    isEditingRef.current = false;
                                                }, 2000);
                                            }}
                                            onFocus={() => {
                                                isEditingRef.current = true;
                                            }}
                                            onBlur={() => {
                                                setTimeout(() => {
                                                    isEditingRef.current = false;
                                                }, 500);
                                            }}
                                            height={600}
                                            preview="live"
                                            className="!border-0"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : viewMode === "list" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentNotes && Array.isArray(recentNotes) && recentNotes.length > 0 ? (
                                    recentNotes.map((noteItem: any) => (
                                        <div
                                            key={noteItem.id}
                                            onClick={() => {
                                                setSelectedDate(new Date(noteItem.date));
                                                setViewMode("note");
                                            }}
                                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                    {format(new Date(noteItem.date), "MMM d, yyyy")}
                                                </div>
                                                <FileText size={16} className="text-gray-400" />
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                                                {truncateContent(noteItem.content, 150)}
                                            </div>
                                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                Updated {format(new Date(noteItem.updatedAt), "h:mm a")}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No notes yet. Switch to Note view to create your first note!
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : viewMode === "todos" ? (
                            <AllTodos />
                        ) : viewMode === "habits" ? (
                            <HabitsView date={selectedDate} />
                        ) : (
                            <Analytics />
                        )}

                        {/* Tips */}
                        {viewMode === "note" && (
                            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>💡 Tips:</strong> Use <code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">- [ ]</code> for todos, add <code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">#high</code> for priority. Your notes auto-save!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    {viewMode === "note" && showSidebar && (
                        <div className="space-y-4">
                            {/* Sidebar Navigation */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2">
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant={sidebarView === "todos" ? "default" : "ghost"}
                                        onClick={() => setSidebarView("todos")}
                                        className="flex-1 gap-2"
                                    >
                                        <CheckSquare size={16} />
                                        Todos
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={sidebarView === "habits" ? "default" : "ghost"}
                                        onClick={() => setSidebarView("habits")}
                                        className="flex-1 gap-2"
                                    >
                                        <Target size={16} />
                                        Habits
                                    </Button>
                                </div>
                            </div>

                            {/* Sidebar Content */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                                {sidebarView === "todos" && noteId && (
                                    <TodoDashboard
                                        noteId={noteId}
                                        noteContent={content}
                                        noteDate={dateString}
                                        onTodoChange={() => {
                                            queryClient.invalidateQueries({ queryKey: ["note", dateString] });
                                        }}
                                    />
                                )}
                                {sidebarView === "habits" && <HabitTracker date={selectedDate} />}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History size={20} />
                            Version History
                        </DialogTitle>
                        <DialogDescription>
                            View and restore previous versions of your note from {format(selectedDate, "PPP")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-4">
                        {history && history.length > 0 ? (
                            history.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDateTime(item.createdAt)}
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRestore(item.id)}
                                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                                        >
                                            <RotateCcw size={14} className="mr-1" />
                                            Restore
                                        </Button>
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                        {truncateContent(item.content, 150)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                                No history yet. Edit your note to create versions.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Keyboard Shortcuts Dialog */}
            <KeyboardShortcutsDialog
                open={showShortcuts}
                onOpenChange={setShowShortcuts}
            />
        </div>
    );
}
