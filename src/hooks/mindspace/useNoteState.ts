import { useEffect, useRef, useState } from "react";

interface UseNoteStateProps {
    note: any;
    onAutoSave: (content: string, mood: number | null) => void;
    autoSaveDelay?: number;
}

/**
 * Hook to manage local note state (content, mood) with auto-save
 */
export const useNoteState = ({ note, onAutoSave, autoSaveDelay = 1500 }: UseNoteStateProps) => {
    const [content, setContent] = useState("");
    const [mood, setMood] = useState<number | null>(null);
    const templateAppliedRef = useRef(false);
    const isEditingRef = useRef(false);

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

    // Auto-save with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            const noteContent =
                note && typeof note === "object" && "content" in note ? note.content : "";
            const noteMood =
                note && typeof note === "object" && "mood" in note ? (note as any).mood : null;

            if (content !== noteContent || mood !== noteMood) {
                await onAutoSave(content, mood);
            }
        }, autoSaveDelay);

        return () => clearTimeout(timer);
    }, [content, mood, note, onAutoSave, autoSaveDelay]);

    const handleContentChange = (newContent: string) => {
        isEditingRef.current = true;
        setContent(newContent);
        setTimeout(() => {
            isEditingRef.current = false;
        }, 2000);
    };

    const handleTemplateApply = (templateContent: string) => {
        templateAppliedRef.current = true;
        setContent(templateContent);
    };

    return {
        content,
        setContent,
        mood,
        setMood,
        handleContentChange,
        handleTemplateApply,
        isEditingRef,
    };
};
