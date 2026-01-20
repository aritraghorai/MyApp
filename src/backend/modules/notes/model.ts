import { t } from "elysia";

/**
 * Notes Models and Types
 * Includes all sub-resource models (tags, templates, habits, todos, search)
 * Following Elysia best practices
 */
export namespace NoteModel {
	// ===== Main Note Models =====
	export const create = t.Object({
		date: t.String(), // ISO Date string (YYYY-MM-DD)
		content: t.String(),
		mood: t.Optional(t.Number()), // 1-5 scale
	});

	export type Create = typeof create.static;

	export const dateQuery = t.Object({
		date: t.String()
	});

	export type DateQuery = typeof dateQuery.static;

	export const rangeQuery = t.Object({
		from: t.String(),
		to: t.String(),
		tags: t.Optional(t.String()), // Comma-separated tag names
		mood: t.Optional(t.String()), // 1-5
	});

	export type RangeQuery = typeof rangeQuery.static;

	export const idParam = t.Object({
		id: t.String(),
	});

	export type IdParam = typeof idParam.static;

	export const historyIdParam = t.Object({
		id: t.String(),
		historyId: t.String(),
	});

	export type HistoryIdParam = typeof historyIdParam.static;

	// ===== Note Tags Models =====
	export const createTag = t.Object({
		name: t.String(),
		color: t.Optional(t.String()),
	});

	export type CreateTag = typeof createTag.static;

	export const updateTag = t.Object({
		name: t.Optional(t.String()),
		color: t.Optional(t.String()),
	});

	export type UpdateTag = typeof updateTag.static;

	export const noteTagParam = t.Object({
		noteId: t.String(),
		tagId: t.String(),
	});

	export type NoteTagParam = typeof noteTagParam.static;

	// ===== Note Templates Models =====
	export const createTemplate = t.Object({
		name: t.String(),
		content: t.String(),
		category: t.Optional(t.String()),
	});

	export type CreateTemplate = typeof createTemplate.static;

	export const updateTemplate = t.Object({
		name: t.Optional(t.String()),
		content: t.Optional(t.String()),
		category: t.Optional(t.String()),
	});

	export type UpdateTemplate = typeof updateTemplate.static;

	export const applyTemplate = t.Object({
		date: t.Optional(t.String()), // ISO date string
		variables: t.Optional(t.Record(t.String(), t.String())),
	});

	export type ApplyTemplate = typeof applyTemplate.static;

	// ===== Habits Models =====
	export const createHabit = t.Object({
		name: t.String(),
		description: t.Optional(t.String()),
		color: t.Optional(t.String()),
		frequency: t.Optional(
			t.Union([t.Literal("DAILY"), t.Literal("WEEKLY"), t.Literal("MONTHLY")]),
		),
		endDate: t.Optional(t.String()), // ISO date string
		metadataSchema: t.Optional(t.Any()), // JSON schema for metadata fields
	});

	export type CreateHabit = typeof createHabit.static;

	export const updateHabit = t.Object({
		name: t.Optional(t.String()),
		description: t.Optional(t.String()),
		color: t.Optional(t.String()),
		frequency: t.Optional(
			t.Union([t.Literal("DAILY"), t.Literal("WEEKLY"), t.Literal("MONTHLY")]),
		),
		endDate: t.Optional(t.String()),
		metadataSchema: t.Optional(t.Any()),
	});

	export type UpdateHabit = typeof updateHabit.static;

	export const logHabit = t.Object({
		date: t.String(), // ISO date string
		completed: t.Boolean(),
		metadata: t.Optional(t.Any()), // JSON metadata values
		notes: t.Optional(t.String()), // Optional notes
	});

	export type LogHabit = typeof logHabit.static;

	export const habitLogsQuery = t.Object({
		from: t.String(),
		to: t.String(),
		habitId: t.Optional(t.String()),
	});

	export type HabitLogsQuery = typeof habitLogsQuery.static;

	export const habitStatsQuery = t.Object({
		habitId: t.Optional(t.String()),
	});

	export type HabitStatsQuery = typeof habitStatsQuery.static;

	// ===== Todos Models =====
	export const createTodo = t.Object({
		noteId: t.String(),
		content: t.String(),
		priority: t.Optional(
			t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")]),
		),
		position: t.Optional(t.Number()),
	});

	export type CreateTodo = typeof createTodo.static;

	export const updateTodo = t.Object({
		content: t.Optional(t.String()),
		completed: t.Optional(t.Boolean()),
		priority: t.Optional(
			t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")]),
		),
		position: t.Optional(t.Number()),
	});

	export type UpdateTodo = typeof updateTodo.static;

	export const noteIdParam = t.Object({
		noteId: t.String(),
	});

	export type NoteIdParam = typeof noteIdParam.static;

	export const todoIncompleteQuery = t.Object({
		limit: t.Optional(t.String()),
	});

	export type TodoIncompleteQuery = typeof todoIncompleteQuery.static;

	export const todoMigrateBody = t.Object({
		toDate: t.String(), // ISO date string
	});

	export type TodoMigrateBody = typeof todoMigrateBody.static;

	export const todoStatsQuery = t.Object({
		from: t.Optional(t.String()),
		to: t.Optional(t.String()),
	});

	export type TodoStatsQuery = typeof todoStatsQuery.static;

	// ===== Search Models =====
	export const searchQuery = t.Object({
		q: t.Optional(t.String()), // Search query
		from: t.Optional(t.String()),
		to: t.Optional(t.String()),
		tags: t.Optional(t.String()), // Comma-separated
		mood: t.Optional(t.String()),
		hasTodos: t.Optional(t.String()), // "true" or "false"
	});

	export type SearchQuery = typeof searchQuery.static;

	export const analyticsQuery = t.Object({
		from: t.Optional(t.String()),
		to: t.Optional(t.String()),
	});

	export type AnalyticsQuery = typeof analyticsQuery.static;
}
