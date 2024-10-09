import type { BookPublic } from '@/schemas/books';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export type BookRowPacketData = RowDataPacket & UnwrapSchema<typeof BookPublic>;
