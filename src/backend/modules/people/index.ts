import { Elysia } from "elysia";
import { authPlugin } from "../../auth-plugin";
import { PersonModel } from "./model";
import { PersonService } from "./service";

export const people = new Elysia({ prefix: "/people" })
	.use(authPlugin)
	.model({
		"person.create": PersonModel.create,
		"person.update": PersonModel.update,
		"person.idParam": PersonModel.idParam,
	})
	.get(
		"/",
		async ({ user }) => {
			return await PersonService.getAll(user.id);
		},
		{ auth: true },
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const person = await PersonService.getById(id);
			if (!person) {
				set.status = 404;
				return "Person not found";
			}
			return person;
		},
		{
			auth: true,
			params: "person.idParam",
		},
	)
	.post(
		"/",
		async ({ body, user }) => {
			return await PersonService.create(body, user.id);
		},
		{
			auth: true,
			body: "person.create",
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				return await PersonService.update(id, body);
			} catch (_e) {
				set.status = 404;
				return "Person not found";
			}
		},
		{
			auth: true,
			params: "person.idParam",
			body: "person.update",
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			try {
				return await PersonService.delete(id);
			} catch (_e) {
				set.status = 404;
				return "Person not found";
			}
		},
		{
			auth: true,
			params: "person.idParam",
		},
	);
