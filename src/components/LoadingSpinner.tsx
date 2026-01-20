export function LoadingSpinner() {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50">
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					{/* Outer spinning ring */}
					<div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
					{/* Gradient spinning ring */}
					<div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 border-r-blue-600 rounded-full animate-spin" />
				</div>
				<p className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
					Loading...
				</p>
			</div>
		</div>
	);
}
