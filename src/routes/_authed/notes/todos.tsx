import { createFileRoute } from "@tanstack/react-router";
import { AllTodos } from "@/components/mindspace/organisms/AllTodos";

export const Route = createFileRoute("/_authed/notes/todos")({
  component: TodosPage,
});

function TodosPage() {
  return (
    <div style={{ viewTransitionName: "page" } as any}>
      <AllTodos />
    </div>
  );
}
