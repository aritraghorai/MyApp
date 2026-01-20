import { t } from "elysia";

export namespace NoteTodoModel {
    export const create = t.Object({
        noteId: t.String(),
        content: t.String(),
        priority: t.Optional(
            t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")]),
        ),
        position: t.Optional(t.Number()),
    });

    export type Create = typeof create.static;

    export const update = t.Object({
        content: t.Optional(t.String()),
        completed: t.Optional(t.Boolean()),
        priority: t.Optional(
            t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")]),
        ),
        position: t.Optional(t.Number()),
    });

    export type Update = typeof update.static;

    export const idParam = t.Object({
        id: t.String(),
    });

    export type IdParam = typeof idParam.static;

    export const noteIdParam = t.Object({
        noteId: t.String(),
    });

    export type NoteIdParam = typeof noteIdParam.static;

    export const incompleteQuery = t.Object({
        limit: t.Optional(t.String()),
    });

    export type IncompleteQuery = typeof incompleteQuery.static;

    export const migrateBody = t.Object({
        toDate: t.String(),
    });

    export type MigrateBody = typeof migrateBody.static;

    export const statsQuery = t.Object({
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
    });

    export type StatsQuery = typeof statsQuery.static;
}
