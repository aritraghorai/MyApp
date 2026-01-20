import { Keyboard } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
	open,
	onOpenChange,
}: KeyboardShortcutsDialogProps) {
	const shortcuts = [
		{
			category: "Text Formatting",
			items: [
				{ keys: ["Ctrl", "B"], description: "Bold text" },
				{ keys: ["Ctrl", "I"], description: "Italic text" },
				{ keys: ["Ctrl", "K"], description: "Code block" },
				{ keys: ["Ctrl", "Q"], description: "Quote" },
			],
		},
		{
			category: "Headings",
			items: [
				{ keys: ["Ctrl", "1"], description: "Heading 1" },
				{ keys: ["Ctrl", "2"], description: "Heading 2" },
				{ keys: ["Ctrl", "3"], description: "Heading 3" },
			],
		},
		{
			category: "Lists",
			items: [
				{ keys: ["Ctrl", "L"], description: "Bullet list" },
				{ keys: ["Ctrl", "Shift", "L"], description: "Numbered list" },
			],
		},
		{
			category: "Links & Images",
			items: [{ keys: ["Ctrl", "Shift", "K"], description: "Insert link" }],
		},
		{
			category: "Editor",
			items: [
				{ keys: ["Ctrl", "S"], description: "Save (auto-saves)" },
				{ keys: ["Ctrl", "Z"], description: "Undo" },
				{ keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
			],
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Keyboard size={20} />
						Keyboard Shortcuts
					</DialogTitle>
					<DialogDescription>
						Speed up your writing with these markdown shortcuts
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{shortcuts.map((section) => (
						<div key={section.category}>
							<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
								{section.category}
							</h3>
							<div className="space-y-2">
								{section.items.map((item, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
									>
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{item.description}
										</span>
										<div className="flex items-center gap-1">
											{item.keys.map((key, keyIdx) => (
												<span key={keyIdx} className="flex items-center gap-1">
													<kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
														{key}
													</kbd>
													{keyIdx < item.keys.length - 1 && (
														<span className="text-gray-400">+</span>
													)}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					<div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
						<p className="text-sm text-gray-700 dark:text-gray-300">
							<strong>💡 Tip:</strong> Your notes auto-save as you type! Use{" "}
							<code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">
								- [ ]
							</code>{" "}
							for todos and add{" "}
							<code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">
								#high
							</code>
							,{" "}
							<code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">
								#medium
							</code>
							, or{" "}
							<code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">
								#low
							</code>{" "}
							for priority.
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
