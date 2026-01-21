import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getTreaty } from "@/routes/api.$";
import type { Todo, TodoFilter } from "@/types/mindspace/todo.types";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { TodoEmptyState } from "../atoms/TodoEmptyState";
import { TodoFilterButtons } from "../molecules/TodoFilterButtons";
import { TodoList } from "./TodoList";
import { TodoStats } from "./TodoStats";

interface TodoDashboardProps {
	noteId: string;
	noteDate: string;
	onTodoChange?: () => void;
}

export function TodoDashboard({
	noteId,
	noteDate,
	onTodoChange,
}: TodoDashboardProps) {
	const [filter, setFilter] = useState<TodoFilter>("all");
	const queryClient = useQueryClient();

	// Fetch todos for this note
	const { data: todos = [], isLoading } = useQuery({
		queryKey: ["todos", noteId],
		queryFn: async () => {
			const response = await getTreaty().notes.todos.notes({ noteId }).get();
			if (response.error) throw new Error("Failed to fetch todos");
			return response.data as Todo[];
		},
		enabled: !!noteId,
	});

	// Toggle todo completion
	const toggleTodo = useMutation({
		mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
			const res = await getTreaty().notes.todos({ id }).patch({ completed });
			if (res.error) throw new Error("Failed to update todo");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos", noteId] });
			queryClient.invalidateQueries({ queryKey: ["note", noteDate] });
			onTodoChange?.();
		},
	});

	// Delete todo
	const deleteTodo = useMutation({
		mutationFn: async (id: string) => {
			const response = await getTreaty().notes.todos({ id }).delete();
			if (response.error) throw new Error("Failed to delete todo");
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos", noteId] });
			onTodoChange?.();
		},
	});

	// Calculate stats
	const totalTodos = todos.length;
	const completedCount = todos.filter((t) => t.completed).length;
	const activeCount = totalTodos - completedCount;
	const completionRate = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (totalTodos === 0) {
		return <TodoEmptyState />;
	}

	return (
		<div className="space-y-4">
			{/* Stats */}
			<TodoStats
				totalTodos={totalTodos}
				activeTodos={activeCount}
				completionRate={completionRate}
				variant="compact"
			/>

			{/* Filter buttons */}
			<TodoFilterButtons
				currentFilter={filter}
				onFilterChange={setFilter}
				totalCount={totalTodos}
				activeCount={activeCount}
				completedCount={completedCount}
			/>

			{/* Todo list */}
			<TodoList
				todos={todos}
				filter={filter}
				onToggle={(id, completed) => toggleTodo.mutate({ id, completed })}
				onDelete={(id) => deleteTodo.mutate(id)}
				showDates={false}
				variant="compact"
			/>
		</div>
	);
}
