import { t } from 'elysia';
import type { UnwrapSchema } from 'elysia';
import type { RowDataPacket } from 'mysql2';

import { AuthorPublic } from './authors';
import { CategoryPublic } from './categories';
import { PublisherPublic } from './publishers';

export const BookPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	title: t.String(),
	description: t.String(),
	isbn: t.String(),
	price: t.String(),
	physical_price: t.Nullable(t.String()),
	published_date: t.Date({ format: 'date-time' }),
	cover_image: t.Nullable(t.String()),
	is_active: t.Integer(),
	publisher: t.Nullable(PublisherPublic),
	category: t.Nullable(CategoryPublic),
	authors: t.Nullable(t.Array(AuthorPublic)),
});

export const BooksPublic = t.Object({
	count: t.Integer(),
	data: t.Array(BookPublic),
});

export const BookCreate = t.Object({
	title: t.String({ minLength: 1, maxLength: 255 }),
	description: t.String({ minLength: 1, maxLength: 65535 }), // NOTE: mysql maximum length of TEXT is 65,535
	isbn: t.String({ minLength: 13, maxLength: 13 }), // TODO: isbn how many minl
	price: t.Number({ minimum: 0 }), // TODO: maximum ??? or string
	psysical_price: t.Optional(t.Number({ minimum: 0 })), // TODO: maximum ???
	published_date: t.Date({ format: 'date-time' }),
	cover_image: t.Optional(t.String({ format: 'uri' })),
	is_active: t.Boolean({ default: true }),
	publisher_id: t.Optional(t.String({ format: 'uuid' })),
	category_id: t.Optional(t.String({ format: 'uuid' })),
});

export const BookUpdate = t.Partial(BookCreate); // TODO remove default values

export type BookRowPacketData = RowDataPacket & UnwrapSchema<typeof BookPublic>;
