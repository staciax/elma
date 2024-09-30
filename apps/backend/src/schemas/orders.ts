import { t } from 'elysia';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export const OrderPublic = t.Object({
	id: t.String({ format: 'uuid' }),
});

export const OrdersPublic = t.Object({
	count: t.Integer(),
	data: t.Array(OrderPublic),
});

export type OrderRowPacketData = RowDataPacket &
	UnwrapSchema<typeof OrderPublic>;
