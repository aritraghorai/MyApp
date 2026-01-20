import { Elysia } from "elysia";
import { authPlugin } from "../../../auth-plugin";
import { NoteTagModel } from "./model";
import { NoteTagService } from "./service";

/**
 * Note Tags Controller
 * REST: /notes/tags/*
 */
export const noteTags = new Elysia({ prefix: "/tags" })
    .use(authPlugin)
    .model({
        "noteTag.create": NoteTagModel.create,
        "noteTag.update": NoteTagModel.update,
        "noteTag.idParam": NoteTagModel.idParam,
        "noteTag.noteTagParams": NoteTagModel.noteTagParams,
    })
    // GET /notes/tags - Get all tags with usage count
    .get(
        "/",
        async ({ user }) => {
            return await NoteTagService.getAll(user.id);
        },
        { auth: true },
    )
    // POST /notes/tags - Create new tag
    .post(
        "/",
        async ({ body, user, set }) => {
            try {
                return await NoteTagService.create(body, user.id);
            } catch (error) {
                if (error instanceof Error && error.message === "Tag already exists") {
                    set.status = 409;
                    return { error: error.message };
                }
                throw error;
            }
        },
        {
            auth: true,
            body: "noteTag.create",
        },
    )
    // PATCH /notes/tags/:id - Update tag
    .patch(
        "/:id",
        async ({ params: { id }, body, set }) => {
            try {
                return await NoteTagService.update(id, body);
            } catch (_e) {
                set.status = 404;
                return { error: "Tag not found" };
            }
        },
        {
            auth: true,
            params: "noteTag.idParam",
            body: "noteTag.update",
        },
    )
    // DELETE /notes/tags/:id - Delete tag
    .delete(
        "/:id",
        async ({ params: { id }, set }) => {
            try {
                return await NoteTagService.delete(id);
            } catch (_e) {
                set.status = 404;
                return { error: "Tag not found" };
            }
        },
        {
            auth: true,
            params: "noteTag.idParam",
        },
    )
    // POST /notes/tags/note/:noteId/tag/:tagId - Add tag to note
    .post(
        "/note/:noteId/tag/:tagId",
        async ({ params: { noteId, tagId }, set }) => {
            try {
                return await NoteTagService.addToNote(noteId, tagId);
            } catch (_e) {
                set.status = 400;
                return { error: "Failed to add tag to note" };
            }
        },
        {
            auth: true,
            params: "noteTag.noteTagParams",
        },
    )
    // DELETE /notes/tags/note/:noteId/tag/:tagId - Remove tag from note
    .delete(
        "/note/:noteId/tag/:tagId",
        async ({ params: { noteId, tagId } }) => {
            return await NoteTagService.removeFromNote(noteId, tagId);
        },
        {
            auth: true,
            params: "noteTag.noteTagParams",
        },
    )
    // GET /notes/tags/analytics - Get tag analytics
    .get(
        "/analytics",
        async ({ user }) => {
            return await NoteTagService.getAnalytics(user.id);
        },
        { auth: true },
    );
