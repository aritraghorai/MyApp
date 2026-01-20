import { t } from "elysia";

/**
 * Note Tags Models
 */
export namespace NoteTagModel {
    export const create = t.Object({
        name: t.String(),
        color: t.Optional(t.String()),
    });

    export type Create = typeof create.static;

    export const update = t.Object({
        name: t.Optional(t.String()),
        color: t.Optional(t.String()),
    });

    export type Update = typeof update.static;

    export const idParam = t.Object({
        id: t.String(),
    });

    export type IdParam = typeof idParam.static;

    export const noteTagParams = t.Object({
        noteId: t.String(),
        tagId: t.String(),
    });

    export type NoteTagParams = typeof noteTagParams.static;
}
