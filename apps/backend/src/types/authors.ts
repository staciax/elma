import type { AuthorPublic } from '@/schemas/authors';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export type AuthorRowPacketData = RowDataPacket &
	UnwrapSchema<typeof AuthorPublic>;
