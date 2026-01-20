import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Circle, Square, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateTodoInMarkdown } from "@/lib/todo-parser";
import { getTreaty } from "@/routes/api.$";

interface Todo {
	id: string;
	content: string;
	completed: boolean;
	priority: "LOW" | "MEDIUM" | "HIGH";
	position: number;
}

interface TodoDashboardProps {
	noteId: string;
	noteContent: string;
	noteDate: string; // YYYY-MM-DD format
	onTodoChange?: () => void;
}

const priorityColors = {
	HIGH: "text-red-600 dark:text-red-400 border-red-300 dark:border-red-700",
	MEDIUM:
		"text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
	LOW: "text-green-600 dark:text-green-400 border-green-300 dark:border-green-700",
};

const priorityBadges = {
	HIGH: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
	MEDIUM:
		"bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
	LOW: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};

export function TodoDashboard({
	noteId,
	noteContent,
	noteDate,
	onTodoChange,
}: TodoDashboardProps) {
	const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
	const queryClient = useQueryClient();

	// Fetch todos for this note
	const { data: todos = [], isLoading } = useQuery({
		queryKey: ["todos", noteId],
		queryFn: async () => {
			const response = await getTreaty().notes.todos.notes({ noteId }).get()
			if (response.error) throw new Error("Failed to fetch todos");
			return (response.data) as Todo[];
		},
		enabled: !!noteId,
	});

	// Toggle todo completion
	const toggleTodo = useMutation({
		mutationFn: async ({
			id,
			completed,
		}: {
			id: string;
			content: string;
			completed: boolean;
		}) => {

			const res = await getTreaty().notes.todos({ id }).patch({ completed })

			if (res.error) throw new Error("Failed to update todo");


			return res.data
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
			const response = await getTreaty().notes.todos({ id }).delete()
			if (response.error) throw new Error("Failed to delete todo");
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos", noteId] });
			onTodoChange?.();
		},
	});

	// Filter todos
	const filteredTodos = todos.filter((todo) => {
		if (filter === "active") return !todo.completed;
		if (filter === "completed") return todo.completed;
		return true;
	});

	// Calculate stats
	const totalTodos = todos.length;
	const completedCount = todos.filter((t) => t.completed).length;
	const completionRate =
		totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (totalTodos === 0) {
		return (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				<CheckSquare size={48} className="mx-auto mb-3 opacity-30" />
				<p>No todos yet. Add checkboxes in your note:</p>
				<code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
					- [ ] Your task here
				</code>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Stats */}
			<div className="grid grid-cols-3 gap-3">
				<div className="bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
					<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
						{totalTodos}
					</div>
					<div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
				</div>
				<div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
					<div className="text-2xl font-bold text-green-600 dark:text-green-400">
						{completedCount}
					</div>
					<div className="text-xs text-gray-600 dark:text-gray-400">Done</div>
				</div>
				<div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
					<div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
						{completionRate}%
					</div>
					<div className="text-xs text-gray-600 dark:text-gray-400">Rate</div>
				</div>
			</div>

			{/* Filter buttons */}
			<div className="flex gap-2">
				<Button
					size="sm"
					variant={filter === "all" ? "default" : "outline"}
					onClick={() => setFilter("all")}
				>
					All ({totalTodos})
				</Button>
				<Button
					size="sm"
					variant={filter === "active" ? "default" : "outline"}
					onClick={() => setFilter("active")}
				>
					Active ({totalTodos - completedCount})
				</Button>
				<Button
					size="sm"
					variant={filter === "completed" ? "default" : "outline"}
					onClick={() => setFilter("completed")}
				>
					Done ({completedCount})
				</Button>
			</div>

			{/* Todo list */}
			<div className="space-y-2">
				{filteredTodos.map((todo) => (
					<div
						key={todo.id}
						className={`group flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${todo.completed
							? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
							: `bg-white dark:bg-gray-800 ${priorityColors[todo.priority]}`
							}`}
					>
						{/* Checkbox */}
						<button
							type="button"
							onClick={() =>
								toggleTodo.mutate({
									id: todo.id,
									content: todo.content,
									completed: !todo.completed,
								})
							}
							className="mt-0.5 shrink-0"
						>
							{todo.completed ? (
								<CheckSquare
									size={20}
									className="text-green-600 dark:text-green-400"
								/>
							) : (
								<Square
									size={20}
									className="text-gray-400 hover:text-purple-600"
								/>
							)}
						</button>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<p
								className={`text-sm ${todo.completed
									? "line-through text-gray-500 dark:text-gray-400"
									: "text-gray-900 dark:text-gray-100"
									}`}
							>
								{todo.content}
							</p>
						</div>

						{/* Priority badge */}
						{!todo.completed && (
							<span
								className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadges[todo.priority]}`}
							>
								{todo.priority}
							</span>
						)}

						{/* Delete button */}
						<Button
							onClick={() => deleteTodo.mutate(todo.id)}
							className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
						>
							<Trash2 size={16} />
						</Button>
					</div>
				))}
			</div>

			{filteredTodos.length === 0 && (
				<div className="text-center py-6 text-gray-500 dark:text-gray-400">
					<Circle size={32} className="mx-auto mb-2 opacity-30" />
					<p className="text-sm">No {filter} todos</p>
				</div>
			)}
		</div>
	);
}
