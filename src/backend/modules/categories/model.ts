import { t } from "elysia";

export namespace CategoryModel {
	export const create = t.Object({
		name: t.String(),
		description: t.Optional(t.String()),
	});

	export type Create = typeof create.static;

	export const update = t.Partial(create);

	export type Update = typeof update.static;

	export const idParam = t.Object({
		id: t.String(),
	});

	export type IdParam = typeof idParam.static;
}
