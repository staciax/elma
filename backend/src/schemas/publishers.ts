import { t } from "elysia";

export const PublisherPublic = t.Object({
	id: t.String({ format: "uuid" }),
	name: t.String()
});

export const PublishersPublic = t.Object({
	count: t.Integer(),
	data: t.Array(PublisherPublic)
});
