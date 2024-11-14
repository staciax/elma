import { t } from "elysia";

export const OffsetBasedPagination = t.Object({
	limit: t.Number({ minimum: 1, default: 100 }),
	offset: t.Number({ minimum: 0, default: 0 }),
	sort_by: t.String({ default: "id" })
});

export const PageBasedPagination = t.Object({
	// limit: t.Number({ minimum: 1, default: 100 }),
	page: t.Number({ minimum: 1, default: 1 }),
	per_page: t.Number({ minimum: 1, default: 100 }),
	sort_by: t.String({ default: "id" })
});
