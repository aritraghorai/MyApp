import { createFileRoute } from "@tanstack/react-router";
import { HabitsView } from "@/components/mindspace/organisms/HabitsView";
import { useNotesContext } from "@/contexts/NotesContext";

export const Route = createFileRoute("/_authed/notes/habits")({
  component: HabitsPage,
});

function HabitsPage() {
  const { selectedDate } = useNotesContext();

  return (
    <div style={{ viewTransitionName: "page" } as any}>
      <HabitsView date={selectedDate} />
    </div>
  );
}
