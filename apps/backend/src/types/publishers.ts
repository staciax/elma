import type { PublisherPublic } from '@/schemas/publishers';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export type PublisherRowPacketData = RowDataPacket &
	UnwrapSchema<typeof PublisherPublic>;
