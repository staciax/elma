import { t } from 'elysia';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export const CategoryPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	name: t.String(),
});

export const CategoriesPublic = t.Object({
	count: t.Integer(),
	data: t.Array(CategoryPublic),
});

export type CategoryRowPacketData = RowDataPacket &
	UnwrapSchema<typeof CategoryPublic>;
