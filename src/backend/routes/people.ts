import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { authPlugin } from "../auth-plugin";

export const people = new Elysia({ prefix: "/people" })
	.use(authPlugin)
	.model({
		person: t.Object({
			name: t.String(),
		}),
	})
	.get(
		"/",
		async ({ user }) => {
			return await prisma.person.findMany({
				where: {
					userId: user.id,
				},
				orderBy: { name: "asc" },
			});
		},
		{
			auth: true,
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const person = await prisma.person.findUnique({
				where: { id },
			});
			if (!person) {
				set.status = 404;
				return "Person not found";
			}
			return person;
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.post(
		"/",
		async ({ body, user }) => {
			return await prisma.person.create({
				data: {
					...body,
					userId: user.id,
				},
			});
		},
		{
			auth: true,
			body: "person",
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				return await prisma.person.update({
					where: { id },
					data: body,
				});
			} catch (e) {
				set.status = 404;
				return "Person not found";
			}
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
			body: t.Partial(
				t.Object({
					name: t.String(),
				}),
			),
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			try {
				return await prisma.person.delete({
					where: { id },
				});
			} catch (e) {
				set.status = 404;
				return "Person not found";
			}
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
		},
	);
