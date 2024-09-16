import { t } from 'elysia';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

export const PublisherPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	name: t.String(),
});

export const PublishersPublic = t.Object({
	count: t.Integer(),
	data: t.Array(PublisherPublic),
});

export type PublisherRowPacketData = RowDataPacket &
	UnwrapSchema<typeof PublisherPublic>;
