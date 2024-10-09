import type { OrderPublic } from '@/schemas/orders';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export type OrderRowPacketData = RowDataPacket &
	UnwrapSchema<typeof OrderPublic>;
