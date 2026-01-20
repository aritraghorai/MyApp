import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Settings, Sparkles, Trash2 } from "lucide-react";
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
import { DEFAULT_TEMPLATES, renderTemplate } from "@/lib/template-engine";

interface TemplatePickerProps {
	onApplyTemplate: (content: string) => void;
	currentDate: Date;
}

interface CustomTemplate {
	id: string;
	name: string;
	category: string;
	content: string;
}

const TEMPLATE_ICONS: Record<string, string> = {
	dailyJournal: "📝",
	meetingNotes: "📋",
	dailyStandup: "🎯",
	weeklyReview: "📊",
	gratitudeLog: "🙏",
	projectPlanning: "📁",
};

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
	dailyJournal: "Daily reflection with goals, notes, and gratitude",
	meetingNotes: "Structured meeting notes with agenda and action items",
	dailyStandup: "Quick standup format: yesterday, today, blockers",
	weeklyReview: "Weekly reflection on wins, challenges, and priorities",
	gratitudeLog: "Daily gratitude practice with reflection",
	projectPlanning: "Project planning with milestones and timeline",
};

export function TemplatePicker({
	onApplyTemplate,
	currentDate,
}: TemplatePickerProps) {
	const [open, setOpen] = useState(false);
	const [manageOpen, setManageOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(
		null,
	);
	const [formData, setFormData] = useState({
		name: "",
		category: "Personal",
		content: "",
	});
	const queryClient = useQueryClient();

	// Fetch custom templates
	const { data: customTemplates = [] } = useQuery<CustomTemplate[]>({
		queryKey: ["custom-templates"],
		queryFn: async () => {
			const response = await fetch("/api/notes/templates", {
				credentials: "include",
			});
			if (!response.ok) return [];
			return (await response.json()) as CustomTemplate[];
		},
	});

	// Create/Update template mutation
	const saveTemplate = useMutation({
		mutationFn: async (template: {
			id?: string;
			name: string;
			category: string;
			content: string;
		}) => {
			const url = template.id
				? `/api/notes/templates/${template.id}`
				: "/api/notes/templates";
			const method = template.id ? "PATCH" : "POST";
			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(template),
			});
			if (!response.ok) throw new Error("Failed to save template");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["custom-templates"] });
			setFormData({ name: "", category: "Personal", content: "" });
			setEditingTemplate(null);
		},
	});

	// Delete template mutation
	const deleteTemplate = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/notes/templates/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to delete template");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["custom-templates"] });
		},
	});

	const handleSelectTemplate = (templateKey: string, isCustom = false) => {
		let content: string;
		if (isCustom) {
			const template = customTemplates.find((t) => t.id === templateKey);
			content = template ? template.content : "";
		} else {
			const template =
				DEFAULT_TEMPLATES[templateKey as keyof typeof DEFAULT_TEMPLATES];
			content = template ? template.content : "";
		}
		const renderedContent = renderTemplate(content, { date: currentDate });
		console.log(
			"Template selected, rendered content:",
			renderedContent.substring(0, 100),
		);
		onApplyTemplate(renderedContent);
		setOpen(false);
	};

	const handleEditTemplate = (template: CustomTemplate) => {
		setEditingTemplate(template);
		setFormData({
			name: template.name,
			category: template.category,
			content: template.content,
		});
	};

	const handleSaveTemplate = () => {
		if (!formData.name || !formData.content) return;
		saveTemplate.mutate({
			id: editingTemplate?.id,
			...formData,
		});
	};

	const templates = Object.entries(DEFAULT_TEMPLATES);
	const personalTemplates = templates.filter(
		([_, t]) => t.category === "Personal",
	);
	const workTemplates = templates.filter(([_, t]) => t.category === "Work");
	const customPersonal = customTemplates.filter(
		(t) => t.category === "Personal",
	);
	const customWork = customTemplates.filter((t) => t.category === "Work");

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className="gap-2"
			>
				<Sparkles size={16} />
				<span className="hidden sm:inline">Templates</span>
			</Button>

			{/* Template Picker Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle>Choose a Template</DialogTitle>
								<DialogDescription>
									Start your note with a pre-built template
								</DialogDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setOpen(false);
									setManageOpen(true);
								}}
								className="gap-2"
							>
								<Settings size={16} />
								Manage
							</Button>
						</div>
					</DialogHeader>

					<div className="space-y-6">
						{/* Personal Templates */}
						{(personalTemplates.length > 0 || customPersonal.length > 0) && (
							<div>
								<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
									Personal
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{personalTemplates.map(([key, template]) => (
										<button
											key={key}
											type="button"
											onClick={() => handleSelectTemplate(key)}
											className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group"
										>
											<span className="text-2xl shrink-0">
												{TEMPLATE_ICONS[key] || "📄"}
											</span>
											<div className="flex-1 min-w-0">
												<div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
													{template.name}
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{TEMPLATE_DESCRIPTIONS[key]}
												</div>
											</div>
										</button>
									))}
									{customPersonal.map((template) => (
										<button
											key={template.id}
											type="button"
											onClick={() => handleSelectTemplate(template.id, true)}
											className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group"
										>
											<span className="text-2xl shrink-0">✨</span>
											<div className="flex-1 min-w-0">
												<div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
													{template.name}
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													Custom Template
												</div>
											</div>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Work Templates */}
						{(workTemplates.length > 0 || customWork.length > 0) && (
							<div>
								<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
									Work
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{workTemplates.map(([key, template]) => (
										<button
											key={key}
											type="button"
											onClick={() => handleSelectTemplate(key)}
											className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
										>
											<span className="text-2xl shrink-0">
												{TEMPLATE_ICONS[key] || "📄"}
											</span>
											<div className="flex-1 min-w-0">
												<div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
													{template.name}
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{TEMPLATE_DESCRIPTIONS[key]}
												</div>
											</div>
										</button>
									))}
									{customWork.map((template) => (
										<button
											key={template.id}
											type="button"
											onClick={() => handleSelectTemplate(template.id, true)}
											className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
										>
											<span className="text-2xl shrink-0">✨</span>
											<div className="flex-1 min-w-0">
												<div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
													{template.name}
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													Custom Template
												</div>
											</div>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Empty State */}
						{personalTemplates.length === 0 &&
							customPersonal.length === 0 &&
							workTemplates.length === 0 &&
							customWork.length === 0 && (
								<div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
									<FileText size={32} className="mx-auto mb-2 opacity-30" />
									<p>
										No templates available. Create one in the manage section!
									</p>
								</div>
							)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Manage Templates Dialog */}
			<Dialog open={manageOpen} onOpenChange={setManageOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingTemplate ? "Edit Template" : "Manage Custom Templates"}
						</DialogTitle>
						<DialogDescription>
							{editingTemplate
								? "Modify your custom template."
								: "Create, edit, or delete your custom templates."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{!editingTemplate && (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSaveTemplate();
								}}
								className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
							>
								<h4 className="font-semibold text-lg">Create New Template</h4>
								<div>
									<Label htmlFor="templateName">Template Name</Label>
									<Input
										id="templateName"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="e.g., My Daily Reflection"
										required
									/>
								</div>
								<div>
									<Label htmlFor="templateCategory">Category</Label>
									<select
										id="templateCategory"
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="Personal">Personal</option>
										<option value="Work">Work</option>
									</select>
								</div>
								<div>
									<Label htmlFor="templateContent">
										Template Content (Markdown)
									</Label>
									<textarea
										id="templateContent"
										value={formData.content}
										onChange={(e) =>
											setFormData({ ...formData, content: e.target.value })
										}
										placeholder="## My Daily Reflection\n\n### Goals for today:\n- \n\n### Notes:\n- \n\n### Gratitude:\n- "
										rows={8}
										className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										required
									/>
								</div>
								<Button type="submit" disabled={saveTemplate.isPending}>
									{saveTemplate.isPending
										? "Saving..."
										: editingTemplate
											? "Update Template"
											: "Create Template"}
								</Button>
								{editingTemplate && (
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setEditingTemplate(null);
											setFormData({
												name: "",
												category: "Personal",
												content: "",
											});
										}}
										className="ml-2"
									>
										Cancel Edit
									</Button>
								)}
							</form>
						)}

						<h4 className="font-semibold text-lg mt-6">
							Your Custom Templates
						</h4>
						{customTemplates.length === 0 ? (
							<p className="text-gray-500 dark:text-gray-400">
								No custom templates yet. Create one above!
							</p>
						) : (
							<div className="space-y-2">
								{customTemplates.map((template) => (
									<div
										key={template.id}
										className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-900"
									>
										<div>
											<div className="font-medium">{template.name}</div>
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{template.category}
											</div>
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleEditTemplate(template)}
											>
												<Settings size={16} />
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => deleteTemplate.mutate(template.id)}
												disabled={deleteTemplate.isPending}
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
