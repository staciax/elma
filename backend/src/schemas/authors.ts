import { t } from 'elysia';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export const AuthorPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	name: t.String(),
});

export const AuthorsPublic = t.Object({
	count: t.Integer(),
	data: t.Array(AuthorPublic),
});

export type AuthorRowPacketData = RowDataPacket &
	UnwrapSchema<typeof AuthorPublic>;
