import { t } from 'elysia';

export const OffsetBasedPagination = t.Object({
	limit: t.Number({ minimum: 1, default: 100 }),
	offset: t.Number({ minimum: 0, default: 0 }),
});
