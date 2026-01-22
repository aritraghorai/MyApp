import { createContext, useContext } from "react";

interface NotesContextType {
    selectedDate: Date;
}

const NotesContext = createContext<NotesContextType | null>(null);

export const NotesProvider = NotesContext.Provider;

export const useNotesContext = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error("useNotesContext must be used within a NotesProvider");
    }
    return context;
};
