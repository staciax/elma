import { t } from "elysia";

export const AuthorPublic = t.Object({
	id: t.String({ format: "uuid" }),
	name: t.String()
});

export const AuthorsPublic = t.Object({
	count: t.Integer(),
	data: t.Array(AuthorPublic)
});
