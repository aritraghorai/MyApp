import { HabitTracker } from "./HabitTracker";

interface HabitsViewProps {
	date: Date;
}

export function HabitsView({ date }: HabitsViewProps) {
	return (
		<div className="space-y-6">
			<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
				<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					Habit Tracking
				</h2>
				<HabitTracker date={date} />
			</div>
		</div>
	);
}
