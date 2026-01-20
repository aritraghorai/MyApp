import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, startOfDay } from "date-fns";
import { AlertCircle, CheckSquare, Filter } from "lucide-react";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getTreaty } from "@/routes/api.$";

interface Todo {
	id: string;
	content: string;
	completed: boolean;
	priority: "HIGH" | "MEDIUM" | "LOW" | null;
	position: number;
	noteId: string;
	note: {
		date: Date;
	};
}

export function AllTodos() {
	const [statusFilter, setStatusFilter] = useState<
		"all" | "active" | "completed"
	>("all");
	const [priorityFilter, setPriorityFilter] = useState<
		"all" | "HIGH" | "MEDIUM" | "LOW"
	>("all");
	const queryClient = useQueryClient();

	// Fetch all todos
	const { data: todos = [], isLoading } = useQuery({
		queryKey: ["all-todos"],
		queryFn: async () => {
			const response = await getTreaty().notes.todos.incomplete.get()
			if (response.error) throw new Error("Failed to fetch todos");
			return response.data
		},
	});

	// Toggle todo completion
	const toggleTodo = useMutation({
		mutationFn: async ({
			id,
			completed,
			content,
			noteDate,
		}: {
			id: string;
			completed: boolean;
			content: string;
			noteId: string;
			noteDate: string;
		}) => {
			// First, update the todo in the database
			const todoResponse = await getTreaty().notes.todos({ id }).patch({
				completed,
			});
			if (todoResponse.error) throw new Error("Failed to update todo");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-todos"] });
			queryClient.invalidateQueries({ queryKey: ["note"] });
			queryClient.invalidateQueries({ queryKey: ["notes-range"] });
		},
	});

	// Filter todos
	const filteredTodos = todos.filter((todo) => {
		if (statusFilter === "active" && todo.completed) return false;
		if (statusFilter === "completed" && !todo.completed) return false;
		if (priorityFilter !== "all" && todo.priority !== priorityFilter)
			return false;
		return true;
	});

	// Group by date
	const groupedTodos = filteredTodos.reduce(
		(acc, todo) => {
			const dateKey = format(new Date(todo.note.date), "yyyy-MM-dd");
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(todo);
			return acc;
		},
		{} as Record<string, Todo[]>,
	);

	const sortedDates = Object.keys(groupedTodos).sort((a, b) =>
		b.localeCompare(a),
	);

	const stats = {
		total: todos.length,
		completed: todos.filter((t) => t.completed).length,
		overdue: todos.filter(
			(t) =>
				!t.completed &&
				isPast(startOfDay(new Date(t.note.date))) &&
				format(new Date(t.note.date), "yyyy-MM-dd") !==
				format(new Date(), "yyyy-MM-dd"),
		).length,
	};

	const completionRate =
		stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
				<div className="flex items-center gap-2 mb-3">
					<Filter size={18} className="text-gray-600 dark:text-gray-400" />
					<h3 className="font-semibold text-gray-900 dark:text-gray-100">
						Filters
					</h3>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
							Status
						</label>
						<Select
							value={statusFilter}
							onValueChange={(v: any) => setStatusFilter(v)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Tasks</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
							Priority
						</label>
						<Select
							value={priorityFilter}
							onValueChange={(v: any) => setPriorityFilter(v)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Priorities</SelectItem>
								<SelectItem value="HIGH">High</SelectItem>
								<SelectItem value="MEDIUM">Medium</SelectItem>
								<SelectItem value="LOW">Low</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
					<div className="text-2xl font-bold">{stats.total}</div>
					<div className="text-sm opacity-90">Total Tasks</div>
				</div>
				<div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
					<div className="text-2xl font-bold">{stats.completed}</div>
					<div className="text-sm opacity-90">Completed</div>
				</div>
				<div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
					<div className="text-2xl font-bold">{stats.overdue}</div>
					<div className="text-sm opacity-90">Overdue</div>
				</div>
				<div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
					<div className="text-2xl font-bold">{completionRate}%</div>
					<div className="text-sm opacity-90">Completion</div>
				</div>
			</div>

			{/* Todos List */}
			<div className="space-y-4">
				{sortedDates.length === 0 ? (
					<div className="text-center py-12 text-gray-500 dark:text-gray-400">
						<CheckSquare size={48} className="mx-auto mb-4 opacity-30" />
						<p>No tasks found</p>
					</div>
				) : (
					sortedDates.map((dateKey) => {
						const dateTodos = groupedTodos[dateKey];
						const isOverdue =
							isPast(startOfDay(new Date(dateKey))) &&
							dateKey !== format(new Date(), "yyyy-MM-dd");
						const dateLabel = format(new Date(dateKey), "EEEE, MMM d, yyyy");

						return (
							<div
								key={dateKey}
								className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4"
							>
								<div className="flex items-center gap-2 mb-3">
									<h3 className="font-semibold text-gray-900 dark:text-gray-100">
										{dateLabel}
									</h3>
									{isOverdue && (
										<span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">
											<AlertCircle size={12} />
											Overdue
										</span>
									)}
								</div>

								<div className="space-y-2">
									{dateTodos.map((todo) => (
										<div
											key={todo.id}
											className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
										>
											<button
												type="button"
												onClick={() =>
													toggleTodo.mutate({
														id: todo.id,
														completed: !todo.completed,
														content: todo.content,
														noteId: todo.noteId,
														noteDate: format(
															new Date(todo.note.date),
															"yyyy-MM-dd",
														),
													})
												}
												className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer hover:scale-110 transition-transform ${todo.completed
													? "bg-green-500 border-green-500"
													: "border-gray-300 dark:border-gray-600 hover:border-gray-400"
													}`}
											>
												{todo.completed && (
													<svg
														className="w-3 h-3 text-white"
														fill="none"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="3"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<title>Completed</title>
														<path d="M5 13l4 4L19 7" />
													</svg>
												)}
											</button>

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

											{todo.priority && (
												<span
													className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${todo.priority === "HIGH"
														? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
														: todo.priority === "MEDIUM"
															? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
															: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
														}`}
												>
													{todo.priority}
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
