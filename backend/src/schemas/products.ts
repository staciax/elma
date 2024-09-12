import { t } from 'elysia';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';
import { AuthorPublic } from './authors';
import { CategoryPublic } from './categories';
import { PublisherPublic } from './publishers';

export const ProductPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	title: t.String(),
	description: t.String(),
	isbn: t.String(),
	published_date: t.Date({ format: 'date-time' }),
	publisher: t.Nullable(PublisherPublic),
	category: t.Nullable(CategoryPublic),
	authors: t.Nullable(t.Array(AuthorPublic)),
});

export const ProductsPublic = t.Object({
	count: t.Integer(),
	data: t.Array(ProductPublic),
});

export type ProductRowPacketData = RowDataPacket &
	UnwrapSchema<typeof ProductPublic> & {
		authors: string;
		publisher_id?: string;
		publisher_name?: string;
		category_id?: string;
		category_name?: string;
	};
