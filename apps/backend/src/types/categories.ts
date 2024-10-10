import type { CategoryPublic } from '@/schemas/categories';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export type CategoryRow = RowDataPacket & UnwrapSchema<typeof CategoryPublic>;
