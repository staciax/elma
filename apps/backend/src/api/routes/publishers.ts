import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { type BookRowPacketData, BooksPublic } from '@/schemas/books';
import { Message } from '@/schemas/message';
import {
	PublisherPublic,
	type PublisherRowPacketData,
	PublishersPublic,
} from '@/schemas/publishers';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

// TODO: response schema

export const router = new Elysia({
	prefix: '/publishers',
	tags: ['publishers'],
})

	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			SELECT
				publishers.id AS id,
				publishers.name AS name
			FROM
				publishers
			-- ORDER BY id
			LIMIT ?
			OFFSET ?;
			`;
			const [results] = await conn.query<PublisherRowPacketData[]>(stmt, [
				limit,
				offset,
			]);
			conn.release();
			return {
				count: 1,
				data: results,
			};
		},
		{
			query: t.Object({
				limit: t.Number({ minimum: 1, default: 100 }),
				offset: t.Number({ minimum: 0, default: 0 }),
			}),
			response: {
				200: PublishersPublic,
			},
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();

			const stmt = `
			SELECT
				*
			FROM
				publishers
			WHERE id = ?;
			`;
			const [results] = await conn.query<PublisherRowPacketData[]>(stmt, [id]);
			conn.release();
			if (!results.length) {
				throw new HTTPError(404, 'Publisher not found');
			}
			return results[0];
		},
		{
			query: t.Object({
				limit: t.Optional(t.Number({ default: 100 })),
				offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
			}),
			response: {
				200: PublisherPublic,
			},
		},
	)
	.guard((app) =>
		app
			.use(superuser())
			.post(
				'/',
				async ({ set, body: { name } }) => {
					const conn = await pool.getConnection();
					const stmt = `
					INSERT INTO publishers
					(	
						id,
						name
					)
					VALUES
					(	
						?,
						?
					);
					`;
					await conn.query<ResultSetHeader>(stmt, [uuidv7(), name]);
					conn.release();

					set.status = 201;
					return { message: 'Publisher created' };
				},
				{
					body: t.Object({
						name: t.String({ minLength: 1, maxLength: 255 }),
					}),
					response: {
						201: Message,
					},
				},
			)
			.patch(
				'/:id',
				async ({ params: { id }, body: { name } }) => {
					const conn = await pool.getConnection();
					const publisherStmt = `
					SELECT
						*
					FROM
						publishers
					WHERE
						id = ?`;
					const [updatePublisher] = await conn.query<RowDataPacket[]>(
						publisherStmt,
						[id],
					);
					if (!updatePublisher.length) {
						conn.release();
						throw new HTTPError(404, 'Publisher not found');
					}

					// TODO: update publisher

					conn.release();

					return { message: 'Publisher updated successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					body: t.Object({
						name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
					}),
					response: {
						200: Message,
					},
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					const publisherStmt = `
					SELECT
						*
					FROM
						publishers
					WHERE
						id = ?`;
					const [deletePublisher] = await conn.query<RowDataPacket[]>(
						publisherStmt,
						[id],
					);
					if (!deletePublisher.length) {
						conn.release();
						throw new HTTPError(404, 'Publisher not found');
					}

					const deletePublisherStmt = `
					DELETE FROM
						publishers 
					WHERE 
						id = ?
					`;
					await conn.execute<ResultSetHeader>(deletePublisherStmt, [id]);
					conn.release();

					return { message: 'Publisher deleted successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					response: {
						200: Message,
					},
				},
			),
	)
	// get books by publisher
	.get(
		'/:id/books',
		async ({ params: { id: publisher_id }, query: { limit, offset } }) => {
			// TODO: remove duplicate code

			const conn = await pool.getConnection();

			const publisher_stmt = `
			SELECT
				*
			FROM
				publishers
			WHERE
				id = ?;
			`;
			const [publisher_results] = await conn.query<BookRowPacketData[]>(
				publisher_stmt,
				[publisher_id],
			);

			if (!publisher_results.length) {
				conn.release();

				throw new HTTPError(404, 'Publisher not found');
			}

			await conn.beginTransaction();

			// TODO: set isolation level

			const count_stmt = 'SELECT COUNT(*) AS count FROM books';
			const [count_results] =
				await conn.query<(RowDataPacket & { count: number })[]>(count_stmt);
			if (!count_results.length) {
				throw new HTTPError(404, 'Book not found');
			}
			const count = count_results[0].count;

			const book_stmt = `
			SELECT
				book.id AS id,
				book.title AS title,
				book.description AS description,
				book.isbn AS isbn,
				book.price AS price,
				book.physical_price AS physical_price,
				book.published_date AS published_date,
				book.cover_image AS cover_image,
				book.is_active AS is_active,

				IF(publisher.id IS NULL, NULL,
					JSON_OBJECT(
						'id', publisher.id,
						'name', publisher.name
					)
				) AS publisher,

				IF(category.id IS NULL, NULL, 
					JSON_OBJECT(
						'id', category.id,
						'name', category.name
					)
				) AS category, 

				IF(COUNT(author.id) = 0, NULL,
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'id', author.id,
							'name', author.name
						)
					)
				) AS authors
			FROM
				books as book
			LEFT JOIN
				publishers AS publisher ON book.publisher_id = publisher.id
			LEFT JOIN
				categories AS category ON book.category_id = category.id
			LEFT JOIN
				book_authors AS book_author ON book.id = book_author.book_id
			LEFT JOIN
				authors AS author ON book_author.author_id = author.id
			GROUP BY book.id
			HAVING JSON_CONTAINS(publisher, JSON_OBJECT('id', ?))
			LIMIT ? OFFSET ?;
			`;
			const [book_results] = await conn.query<BookRowPacketData[]>(book_stmt, [
				publisher_id,
				limit,
				offset,
			]);

			await conn.commit();
			conn.release();

			return {
				count: count,
				data: book_results,
			};
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			query: t.Object({
				limit: t.Number({ minimum: 1, default: 100 }),
				offset: t.Number({ minimum: 0, default: 0 }),
			}),
			response: {
				200: BooksPublic,
			},
		},
	);

// TODO: ahh create a new route for it? or just use query params? in books route
