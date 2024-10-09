import { t } from 'elysia';

export const OrderPublic = t.Object({
	id: t.String({ format: 'uuid' }),
});

export const OrdersPublic = t.Object({
	count: t.Integer(),
	data: t.Array(OrderPublic),
});
