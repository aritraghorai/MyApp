import { Elysia } from "elysia";
import { authPlugin } from "../../auth-plugin";
import { CategoryModel } from "./model";
import { CategoryService } from "./service";

export const categories = new Elysia({ prefix: "/categories" })
	.use(authPlugin)
	.model({
		"category.create": CategoryModel.create,
		"category.update": CategoryModel.update,
		"category.idParam": CategoryModel.idParam,
	})
	.get(
		"/",
		async ({ user }) => {
			return await CategoryService.getAll(user.id);
		},
		{ auth: true },
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const category = await CategoryService.getById(id);
			if (!category) {
				set.status = 404;
				return "Category not found";
			}
			return category;
		},
		{
			auth: true,
			params: "category.idParam",
		},
	)
	.post(
		"/",
		async ({ body, user }) => {
			return await CategoryService.create(body, user.id);
		},
		{
			auth: true,
			body: "category.create",
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				return await CategoryService.update(id, body);
			} catch (_e) {
				set.status = 404;
				return "Category not found";
			}
		},
		{
			auth: true,
			params: "category.idParam",
			body: "category.update",
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			try {
				return await CategoryService.delete(id);
			} catch (_e) {
				set.status = 404;
				return "Category not found";
			}
		},
		{
			auth: true,
			params: "category.idParam",
		},
	);
