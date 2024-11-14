import { t } from "elysia";

export const CategoryPublic = t.Object({
	id: t.String({ format: "uuid" }),
	name: t.String()
});

export const CategoriesPublic = t.Object({
	count: t.Integer(),
	data: t.Array(CategoryPublic)
});
