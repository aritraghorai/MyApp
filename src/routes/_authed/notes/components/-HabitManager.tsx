import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MetadataFieldsEditor } from "./-MetadataFieldsEditor";

interface Habit {
	id: string;
	name: string;
	description?: string;
	color: string;
	frequency: "DAILY" | "WEEKLY" | "MONTHLY";
	endDate?: string;
	metadataSchema?: Record<string, string>;
}

interface HabitManagerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
	{ name: "Purple", value: "#8b5cf6" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Green", value: "#10b981" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Pink", value: "#ec4899" },
	{ name: "Red", value: "#ef4444" },
	{ name: "Yellow", value: "#eab308" },
	{ name: "Teal", value: "#14b8a6" },
];

export function HabitManager({ open, onOpenChange }: HabitManagerProps) {
	const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		color: "#8b5cf6",
		frequency: "DAILY" as "DAILY" | "WEEKLY" | "MONTHLY",
		endDate: "",
		metadataSchema: null as Record<string, string> | null,
	});
	const queryClient = useQueryClient();

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

	// Create habit
	const createHabit = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await fetch("/api/notes/habits", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create habit");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			resetForm();
		},
	});

	// Update habit
	const updateHabit = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<typeof formData>;
		}) => {
			const response = await fetch(`/api/notes/habits/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to update habit");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			resetForm();
			setEditingHabit(null);
		},
	});

	// Delete habit
	const deleteHabit = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/notes/habits/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to delete habit");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			queryClient.invalidateQueries({ queryKey: ["habit-stats"] });
		},
	});

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			color: "#8b5cf6",
			frequency: "DAILY",
			endDate: "",
			metadataSchema: null,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) return;

		if (editingHabit) {
			updateHabit.mutate({ id: editingHabit.id, data: formData });
		} else {
			createHabit.mutate(formData);
		}
	};

	const handleEdit = (habit: Habit) => {
		setEditingHabit(habit);
		setFormData({
			name: habit.name,
			description: habit.description || "",
			color: habit.color,
			frequency: habit.frequency,
			endDate: habit.endDate || "",
			metadataSchema: habit.metadataSchema || null,
		});
	};

	const handleDelete = (id: string) => {
		if (
			confirm(
				"Are you sure you want to delete this habit? All logs will be lost.",
			)
		) {
			deleteHabit.mutate(id);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Habits</DialogTitle>
					<DialogDescription>
						Create and manage your daily habits to track your progress
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Create/Edit Form */}
					<form
						onSubmit={handleSubmit}
						className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
					>
						<h3 className="font-semibold text-sm">
							{editingHabit ? "Edit Habit" : "Create New Habit"}
						</h3>

						<div className="space-y-2">
							<Label htmlFor="name">Habit Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="e.g., Morning Exercise"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description (optional)</Label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="e.g., 30 minutes of cardio"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="frequency">Frequency</Label>
								<Select
									value={formData.frequency}
									onValueChange={(value: any) =>
										setFormData({ ...formData, frequency: value })
									}
								>
									<SelectTrigger id="frequency">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="DAILY">Daily</SelectItem>
										<SelectItem value="WEEKLY">Weekly</SelectItem>
										<SelectItem value="MONTHLY">Monthly</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Color</Label>
								<div className="flex gap-2 flex-wrap">
									{PRESET_COLORS.map((color) => (
										<button
											key={color.value}
											type="button"
											onClick={() =>
												setFormData({ ...formData, color: color.value })
											}
											className={`w-8 h-8 rounded-full border-2 transition-all ${
												formData.color === color.value
													? "border-gray-900 dark:border-white scale-110"
													: "border-transparent hover:scale-105"
											}`}
											style={{ backgroundColor: color.value }}
											title={color.name}
										/>
									))}
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="endDate">End Date (optional)</Label>
							<Input
								id="endDate"
								type="date"
								value={formData.endDate}
								onChange={(e) =>
									setFormData({ ...formData, endDate: e.target.value })
								}
							/>
						</div>

						<MetadataFieldsEditor
							value={formData.metadataSchema}
							onChange={(schema) =>
								setFormData({ ...formData, metadataSchema: schema })
							}
						/>

						<div className="flex gap-2">
							<Button
								type="submit"
								disabled={createHabit.isPending || updateHabit.isPending}
							>
								{editingHabit ? "Update Habit" : "Create Habit"}
							</Button>
							{editingHabit && (
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setEditingHabit(null);
										resetForm();
									}}
								>
									Cancel
								</Button>
							)}
						</div>
					</form>

					{/* Habits List */}
					<div className="space-y-2">
						<h3 className="font-semibold text-sm">Your Habits</h3>
						{habits.length === 0 ? (
							<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
								No habits yet. Create your first habit above!
							</p>
						) : (
							<div className="space-y-2">
								{habits.map((habit) => (
									<div
										key={habit.id}
										className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
									>
										<div
											className="w-4 h-4 rounded-full flex-shrink-0"
											style={{ backgroundColor: habit.color }}
										/>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-sm">{habit.name}</div>
											{habit.description && (
												<div className="text-xs text-gray-500 dark:text-gray-400 truncate">
													{habit.description}
												</div>
											)}
											<div className="text-xs text-gray-400 dark:text-gray-500">
												{habit.frequency}
											</div>
										</div>
										<div className="flex gap-1">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => handleEdit(habit)}
											>
												<Edit2 size={14} />
											</Button>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => handleDelete(habit.id)}
												className="text-red-600 hover:text-red-700"
											>
												<Trash2 size={14} />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
