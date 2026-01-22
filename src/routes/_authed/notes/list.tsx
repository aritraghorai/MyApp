import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NoteListView } from "@/components/mindspace/organisms/NoteListView";
import { useRecentNotes } from "@/hooks/mindspace/useRecentNotes";

export const Route = createFileRoute("/_authed/notes/list")({
  component: ListPage,
});

function ListPage() {
  const navigate = useNavigate();
  const { data: recentNotes } = useRecentNotes(true);

  const handleNoteClick = (date: string) => {
    // Navigate to journal for that date
    navigate({
      to: "/notes/journal",
      search: { date },
    });
  };

  return (
    <div style={{ viewTransitionName: "page" } as any}>
      <NoteListView
        notes={recentNotes as any}
        onNoteClick={handleNoteClick}
      />
    </div>
  );
}
