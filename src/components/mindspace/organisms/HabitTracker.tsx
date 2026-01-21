import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Flame, Plus, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetadataInput } from "../atoms/MetadataInput";
import { HabitManager } from "./HabitManager";

interface Habit {
	id: string;
	name: string;
	description?: string;
	color: string;
	frequency: "DAILY" | "WEEKLY" | "MONTHLY";
	metadataSchema?: Record<string, string>;
}

interface HabitLog {
	id: string;
	habitId: string;
	date: Date;
	completed: boolean;
	metadata?: Record<string, any>;
	notes?: string;
}

interface HabitStats {
	habitId: string;
	habitName: string;
	currentStreak: number;
	longestStreak: number;
	completionRate: number;
}

interface HabitTrackerProps {
	date: Date;
}

export function HabitTracker({ date }: HabitTrackerProps) {
	const [showManage, setShowManage] = useState(false);
	const [loggingHabit, setLoggingHabit] = useState<Habit | null>(null);
	const [logMetadata, setLogMetadata] = useState<Record<string, any> | null>(
		null,
	);
	const [logNotes, setLogNotes] = useState("");
	const queryClient = useQueryClient();
	const dateString = format(date, "yyyy-MM-dd");

	// Fetch habits
	const { data: habits = [] } = useQuery({
		queryKey: ["habits"],
		queryFn: async () => {
			const response = await fetch("/api/notes/habits", {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch habits");
			return (await response.json()) as Habit[];
		},
	});

	// Fetch habit logs for today
	const { data: logs = [] } = useQuery({
		queryKey: ["habit-logs", dateString],
		queryFn: async () => {
			const response = await fetch(
				`/api/notes/habits/logs?from=${dateString}&to=${dateString}`,
				{
					credentials: "include",
				},
			);
			if (!response.ok) throw new Error("Failed to fetch logs");
			return (await response.json()) as HabitLog[];
		},
	});

	// Fetch habit stats
	const { data: stats = [] } = useQuery({
		queryKey: ["habit-stats"],
		queryFn: async () => {
			const response = await fetch("/api/notes/habits/stats", {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch stats");
			return (await response.json()) as HabitStats[];
		},
	});

	// Toggle habit completion
	const toggleHabit = useMutation({
		mutationFn: async ({
			habitId,
			completed,
			metadata,
			notes,
		}: {
			habitId: string;
			completed: boolean;
			metadata?: Record<string, any>;
			notes?: string;
		}) => {
			const response = await fetch(`/api/notes/habits/${habitId}/log`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ date: dateString, completed, metadata, notes }),
			});
			if (!response.ok) throw new Error("Failed to log habit");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habit-logs", dateString] });
			queryClient.invalidateQueries({ queryKey: ["habit-stats"] });
			setLoggingHabit(null);
			setLogMetadata(null);
			setLogNotes("");
		},
	});

	const handleHabitClick = (habit: Habit) => {
		const log = logs.find((l) => l.habitId === habit.id);
		const isCompleted = log?.completed || false;

		// If habit has metadata schema and we're marking it complete, show dialog
		if (
			!isCompleted &&
			habit.metadataSchema &&
			Object.keys(habit.metadataSchema).length > 0
		) {
			setLoggingHabit(habit);
			setLogMetadata(log?.metadata || null);
			setLogNotes(log?.notes || "");
		} else {
			// Simple toggle without metadata
			toggleHabit.mutate({ habitId: habit.id, completed: !isCompleted });
		}
	};

	const handleLogSubmit = () => {
		if (!loggingHabit) return;
		toggleHabit.mutate({
			habitId: loggingHabit.id,
			completed: true,
			metadata: logMetadata,
			notes: logNotes,
		});
	};

	if (habits.length === 0) {
		return (
			<>
				<div className="text-center py-6 text-gray-500 dark:text-gray-400">
					<TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
					<p className="text-sm mb-3">No habits yet</p>
					<Button size="sm" onClick={() => setShowManage(true)}>
						<Plus size={16} className="mr-1" />
						Create Habit
					</Button>
				</div>
				<HabitManager open={showManage} onOpenChange={setShowManage} />
			</>
		);
	}

	return (
		<>
			<div className="space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
						Daily Habits
					</h3>
					<Button size="sm" variant="ghost" onClick={() => setShowManage(true)}>
						<Settings size={14} />
					</Button>
				</div>

				{/* Habit list */}
				<div className="space-y-2">
					{habits.map((habit) => {
						const log = logs.find((l) => l.habitId === habit.id);
						const isCompleted = log?.completed || false;
						const habitStats = stats.find((s) => s.habitId === habit.id);

						return (
							<div
								key={habit.id}
								className="group flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
							>
								{/* Checkbox */}
								<button
									type="button"
									onClick={() => handleHabitClick(habit)}
									className={`
                                        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0
                                        ${isCompleted
											? `bg-gradient-to-br from-green-500 to-emerald-500 border-transparent`
											: "border-gray-300 dark:border-gray-600 hover:border-gray-400"
										}
                                    `}
									style={{
										backgroundColor: isCompleted ? habit.color : undefined,
									}}
								>
									{isCompleted && (
										<svg
											className="w-4 h-4 text-white"
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

								{/* Habit info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span
											className={`text-sm font-medium ${isCompleted
													? "text-gray-500 dark:text-gray-400 line-through"
													: "text-gray-900 dark:text-gray-100"
												}`}
										>
											{habit.name}
										</span>
										{habitStats && habitStats.currentStreak > 0 && (
											<div className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
												<Flame size={14} />
												{habitStats.currentStreak}
											</div>
										)}
									</div>
									{habit.description && (
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											{habit.description}
										</p>
									)}
								</div>

								{/* Stats */}
								{habitStats && (
									<div className="text-xs text-gray-500 dark:text-gray-400">
										{habitStats.completionRate}%
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Habit Manager Dialog */}
			<HabitManager open={showManage} onOpenChange={setShowManage} />

			{/* Metadata Logging Dialog */}
			<Dialog
				open={!!loggingHabit}
				onOpenChange={(open) => !open && setLoggingHabit(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Log {loggingHabit?.name}</DialogTitle>
						<DialogDescription>
							Track your progress with detailed metrics
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<MetadataInput
							schema={loggingHabit?.metadataSchema || null}
							value={logMetadata}
							onChange={setLogMetadata}
						/>

						<div className="space-y-2">
							<Label htmlFor="log-notes">Notes (optional)</Label>
							<Input
								id="log-notes"
								value={logNotes}
								onChange={(e) => setLogNotes(e.target.value)}
								placeholder="How did it go?"
							/>
						</div>

						<div className="flex gap-2">
							<Button onClick={handleLogSubmit} className="flex-1">
								Save
							</Button>
							<Button variant="outline" onClick={() => setLoggingHabit(null)}>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
