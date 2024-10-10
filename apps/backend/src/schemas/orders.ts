import { t } from 'elysia';

export const OrderPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	user_id: t.String({ format: 'uuid' }),
	total_price: t.String(),
	status: t.String(),
	created_at: t.Date(),
	updated_at: t.Date(),
	items: t.Nullable(
		t.Array(
			t.Object({
				price: t.String(),
				book_id: t.String({ format: 'uuid' }),
				order_id: t.String({ format: 'uuid' }),
			}),
		),
	),
});

export const OrderCreate = t.Object({
	user_id: t.String({ format: 'uuid' }),
	total_price: t.Number({ minimum: 0, default: 0 }),
	status: t.Union(
		[
			t.Literal('PENDING'),
			t.Literal('PROCESSING'),
			t.Literal('COMPLETED'),
			t.Literal('CANCELLED'),
		],
		{ default: 'PENDING' },
	),
});

export const OrdersPublic = t.Object({
	count: t.Integer(),
	data: t.Array(OrderPublic),
});
