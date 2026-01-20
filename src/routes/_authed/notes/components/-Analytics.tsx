import { BarChart3, TrendingUp } from "lucide-react";

export function Analytics() {
	return (
		<div className="space-y-6">
			{/* Coming Soon Placeholder */}
			<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
				<div className="flex justify-center mb-4">
					<div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
						<BarChart3 size={48} className="text-white" />
					</div>
				</div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					Analytics Dashboard
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
					Visualize your progress with charts and insights. Track habit
					metadata, writing stats, task completion trends, and mood patterns.
				</p>
				<div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400">
					<TrendingUp size={16} />
					<span>Coming soon with interactive charts!</span>
				</div>
			</div>

			{/* Preview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white shadow-lg">
					<h3 className="font-semibold mb-2">Habit Analytics</h3>
					<p className="text-sm opacity-90">
						Track metadata over time (weight, questions, pages)
					</p>
				</div>
				<div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
					<h3 className="font-semibold mb-2">Writing Stats</h3>
					<p className="text-sm opacity-90">
						Word count trends and writing streaks
					</p>
				</div>
				<div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
					<h3 className="font-semibold mb-2">Task Insights</h3>
					<p className="text-sm opacity-90">
						Completion rates and priority distribution
					</p>
				</div>
			</div>
		</div>
	);
}
