import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useMetadata } from "../../../hooks/useMetadata";

export const Route = createFileRoute("/_authed/expenses/settings")({
	component: Settings,
});

function Settings() {
	const [activeTab, setActiveTab] = useState<"tags" | "categories" | "people">(
		"tags",
	);

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
				Settings
			</h1>

			<div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
				<button
					onClick={() => setActiveTab("tags")}
					className={`pb-2 px-4 font-medium transition-colors ${
						activeTab === "tags"
							? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
							: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
					}`}
				>
					Tags
				</button>
				<button
					onClick={() => setActiveTab("categories")}
					className={`pb-2 px-4 font-medium transition-colors ${
						activeTab === "categories"
							? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
							: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
					}`}
				>
					Categories
				</button>
				<button
					onClick={() => setActiveTab("people")}
					className={`pb-2 px-4 font-medium transition-colors ${
						activeTab === "people"
							? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
							: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
					}`}
				>
					People
				</button>
			</div>

			<div className="mt-6">
				{activeTab === "tags" && <TagsManager />}
				{activeTab === "categories" && <CategoriesManager />}
				{activeTab === "people" && <PeopleManager />}
			</div>
		</div>
	);
}

function TagsManager() {
	const [newName, setNewName] = useState("");
	const { tags } = useMetadata();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await tags.create(newName);
			setNewName("");
		} catch (_error) {
			alert("Failed to create tag");
		}
	};

	const handleUpdate = async (id: string, name: string) => {
		try {
			await tags.update(id, name);
		} catch (_error) {
			alert("Failed to update tag");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await tags.delete(id);
		} catch (_error) {
			alert("Failed to delete tag");
		}
	};

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="flex gap-4">
				<input
					type="text"
					placeholder="New Tag Name"
					required
					className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Add Tag
				</button>
			</form>

			<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{tags.data?.map((tag: any) => (
					<EditableItem
						key={tag.id}
						id={tag.id}
						initialName={tag.name}
						onSave={handleUpdate}
						onDelete={handleDelete}
						type="tag"
					/>
				))}
			</div>
		</div>
	);
}

function CategoriesManager() {
	const [newName, setNewName] = useState("");
	const { categories } = useMetadata();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await categories.create(newName);
			setNewName("");
		} catch (_error) {
			alert("Failed to create category");
		}
	};

	const handleUpdate = async (id: string, name: string) => {
		try {
			await categories.update(id, name);
		} catch (_error) {
			alert("Failed to update category");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await categories.delete(id);
		} catch (_error) {
			alert("Failed to delete category");
		}
	};

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="flex gap-4">
				<input
					type="text"
					placeholder="New Category Name"
					required
					className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Add Category
				</button>
			</form>

			<div className="flex flex-col gap-2">
				{categories.data?.map((category: any) => (
					<EditableItem
						key={category.id}
						id={category.id}
						initialName={category.name}
						onSave={handleUpdate}
						onDelete={handleDelete}
						type="category"
					/>
				))}
			</div>
		</div>
	);
}

function PeopleManager() {
	const [newName, setNewName] = useState("");
	const { people } = useMetadata();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await people.create(newName);
			setNewName("");
		} catch (_error) {
			alert("Failed to create person");
		}
	};

	const handleUpdate = async (id: string, name: string) => {
		try {
			await people.update(id, name);
		} catch (_error) {
			alert("Failed to update person");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await people.delete(id);
		} catch (_error) {
			alert("Failed to delete person");
		}
	};

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="flex gap-4">
				<input
					type="text"
					placeholder="New Person Name"
					required
					className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Add Person
				</button>
			</form>

			<div className="flex flex-col gap-2">
				{people.data?.map((person: any) => (
					<EditableItem
						key={person.id}
						id={person.id}
						initialName={person.name}
						onSave={handleUpdate}
						onDelete={handleDelete}
						type="person"
					/>
				))}
			</div>
		</div>
	);
}

function EditableItem({
	id,
	initialName,
	onSave,
	onDelete,
	type,
}: {
	id: string;
	initialName: string;
	onSave: (id: string, name: string) => void;
	onDelete: (id: string) => void;
	type: string;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(initialName);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleSave = () => {
		if (name.trim() !== initialName) {
			onSave(id, name);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setName(initialName);
		setIsEditing(false);
	};

	return (
		<>
			<div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
				{isEditing ? (
					<div className="flex flex-1 items-center gap-2">
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="flex-1 p-1 px-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") handleCancel();
							}}
						/>
						<button
							onClick={handleSave}
							className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
							title="Save"
						>
							<Check size={18} />
						</button>
						<button
							onClick={handleCancel}
							className="p-1 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
							title="Cancel"
						>
							<X size={18} />
						</button>
					</div>
				) : (
					<>
						<span className="text-gray-900 dark:text-white font-medium">
							{name}
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setIsEditing(true)}
								className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
								title="Edit"
							>
								<Pencil size={16} />
							</button>
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
								title="Delete"
							>
								<Trash2 size={16} />
							</button>
						</div>
					</>
				)}
			</div>

			{showDeleteConfirm && (
				<ConfirmModal
					title={`Delete ${type}`}
					message={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
					onConfirm={() => {
						onDelete(id);
						setShowDeleteConfirm(false);
					}}
					onCancel={() => setShowDeleteConfirm(false)}
				/>
			)}
		</>
	);
}

function ConfirmModal({
	title,
	message,
	onConfirm,
	onCancel,
}: {
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
				<div className="flex items-center gap-3 text-red-600 dark:text-red-400">
					<div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
						<AlertTriangle size={24} />
					</div>
					<h3 className="text-lg font-semibold">{title}</h3>
				</div>

				<p className="text-gray-600 dark:text-gray-300">{message}</p>

				<div className="flex justify-end gap-3 pt-2">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium shadow-sm"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}
