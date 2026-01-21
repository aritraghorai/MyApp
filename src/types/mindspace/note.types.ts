export interface Note {
    id: string;
    date: string;
    content: string;
    mood: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface NoteHistory {
    id: string;
    content: string;
    createdAt: string;
}

export interface NoteListItem {
    id: string;
    date: string;
    content: string;
    updatedAt: string;
}
