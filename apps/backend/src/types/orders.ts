import type { OrderPublic } from '@/schemas/orders';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export type OrderRow = RowDataPacket & UnwrapSchema<typeof OrderPublic>;
