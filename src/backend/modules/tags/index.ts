import { Elysia } from "elysia";
import { authPlugin } from "../../auth-plugin";
import { TagModel } from "./model";
import { TagService } from "./service";

export const tags = new Elysia({ prefix: "/tags" })
	.use(authPlugin)
	.model({
		"tag.create": TagModel.create,
		"tag.update": TagModel.update,
		"tag.idParam": TagModel.idParam,
	})
	.get(
		"/",
		async ({ user }) => {
			return await TagService.getAll(user.id);
		},
		{ auth: true },
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const tag = await TagService.getById(id);
			if (!tag) {
				set.status = 404;
				return "Tag not found";
			}
			return tag;
		},
		{
			auth: true,
			params: "tag.idParam",
		},
	)
	.post(
		"/",
		async ({ body, user }) => {
			return await TagService.create(body, user.id);
		},
		{
			auth: true,
			body: "tag.create",
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				return await TagService.update(id, body);
			} catch (_e) {
				set.status = 404;
				return "Tag not found";
			}
		},
		{
			auth: true,
			params: "tag.idParam",
			body: "tag.update",
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			try {
				return await TagService.delete(id);
			} catch (_e) {
				set.status = 404;
				return "Tag not found";
			}
		},
		{
			auth: true,
			params: "tag.idParam",
		},
	);
