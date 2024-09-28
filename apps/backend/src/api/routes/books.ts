import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { type BookRowPacketData, BooksPublic } from '@/schemas/books';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

// TODO: check sql injection
// TODO: transaction for insert, update, delete
// TODO: remove duplicate code
// TODO: snake_case to camelCase (stmt)
// TODO: what t.Partial do?

export const router = new Elysia({
	prefix: '/books',
	tags: ['books'],
})
	// TODO: add role-based access controls
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();

			await conn.beginTransaction();

			// TODO: set isolation level

			const count_stmt = 'SELECT COUNT(*) AS count FROM books';
			const [count_results] = await conn.query<RowDataPacket[]>(count_stmt);
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
			LIMIT ? OFFSET ?;
			`;
			const [results] = await conn.query<BookRowPacketData[]>(book_stmt, [
				limit,
				offset,
			]);

			await conn.commit();
			conn.release();

			return {
				count: count,
				data: results,
			};
		},
		{
			query: t.Object({
				limit: t.Number({ minimum: 1, default: 100 }),
				offset: t.Number({ minimum: 0, default: 0 }),
			}),
			response: {
				200: BooksPublic,
			},
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();
			const stmt = `
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
				books AS book
			LEFT JOIN
				publishers AS publisher ON book.publisher_id = publisher.id
			LEFT JOIN
				categories AS category ON book.category_id = category.id
			LEFT JOIN
				book_authors AS book_author ON book.id = book_author.book_id
			LEFT JOIN
				authors AS author ON book_author.author_id = author.id
			GROUP BY book.id
			HAVING book.id = ?;
			`;
			// TODO: join book_images

			const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
			conn.release();
			if (!results.length) {
				throw new HTTPError(404, 'Book not found');
			}
			return results;
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.guard((app) =>
		app
			.use(superuser())
			.post(
				'/',
				async ({
					set,
					body: {
						title,
						description,
						isbn,
						price,
						published_date,
						cover_image,
						is_active,
						publisher_id,
						category_id,
					},
				}) => {
					// TODO: make function for get publisher, category, series, authors
					// TODO: begin transaction
					const conn = await pool.getConnection();

					const publisher_stmt = `
					SELECT
						*
					FROM
						publishers
					WHERE
						id = ?`;
					const [publisher] = await conn.query<RowDataPacket[]>(
						publisher_stmt,
						[publisher_id],
					);
					if (publisher_id && !publisher.length) {
						throw new HTTPError(404, 'publisher');
					}

					const category_stmt = `
					SELECT
						*
					FROM
						categories
					WHERE
						id = ?`;
					const [category] = await conn.query<RowDataPacket[]>(category_stmt, [
						category_id,
					]);
					if (category_id && !category.length) {
						throw new HTTPError(404, 'category');
					}

					// TODO: book_authors?

					const book_stmt = `
					INSERT INTO books (
						id,
						title,
						description,
						isbn,
						price,
						published_date,
						cover_image,
						is_active
						publisher_id,
						category_id
					)
					VALUES (
						?,
						?,
						?,
						?,
						?,
						?,
						?,
						?,
						?,
						?
					);
					`;

					await conn.query<ResultSetHeader>(book_stmt, [
						uuidv7(),
						title,
						description,
						isbn,
						price,
						published_date,
						cover_image,
						is_active,
						publisher_id,
						category_id,
					]);

					// TODO: refresh book and return book data
					set.status = 201;
					return { message: 'Book created successfully' };
				},
				{
					body: t.Object({
						title: t.String({ minLength: 1, maxLength: 255 }),
						description: t.String({ minLength: 1, maxLength: 65535 }), // NOTE: mysql maximum length of TEXT is 65,535
						isbn: t.String({ minLength: 13, maxLength: 13 }), // TODO: isbn how many minl
						price: t.Number({ minimum: 0 }), // TODO: maximum ???
						psysical_price: t.Optional(t.Number({ minimum: 0 })), // TODO: maximum ???
						published_date: t.Date({ format: 'date-time' }),
						cover_image: t.Optional(t.String({ format: 'uri' })),
						is_active: t.Optional(t.Boolean({ default: true })),
						publisher_id: t.Optional(t.String({ format: 'uuid' })),
						category_id: t.Optional(t.String({ format: 'uuid' })),
					}),
				},
			)
			.patch(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					const book_stmt = `
					SELECT
						*
					FROM
						books
					WHERE
						id = ?`;

					const [results] = await conn.query<RowDataPacket[]>(book_stmt, [id]);
					if (!results.length) {
						conn.release();
						throw new HTTPError(404, 'Book not found');
					}

					// TODO: update book

					conn.release();

					return { message: 'Book updated successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					body: t.Object({
						title: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
						description: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
						isbn: t.Optional(t.String({ minLength: 13, maxLength: 13 })),
						price: t.Optional(t.Number({ minimum: 0 })),
						psysical_price: t.Optional(t.Number({ minimum: 0 })),
						published_date: t.Optional(t.Date({ format: 'date-time' })),
						cover_image: t.Optional(t.String({ format: 'uri' })),
						is_active: t.Optional(t.Boolean({ default: true })),
						publisher_id: t.Optional(t.String({ format: 'uuid' })),
						category_id: t.Optional(t.String({ format: 'uuid' })),
					}),
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();
					const book_stmt = `
					SELECT
						*
					FROM
						books
					WHERE
						id = ?
					`;
					const [results] = await conn.query<RowDataPacket[]>(book_stmt, [id]);

					if (!results.length) {
						conn.release();
						throw new HTTPError(404, 'Book not found');
					}

					// console.log(results);

					const delete_stmt = `
					DELETE
					FROM
						books
					WHERE
						id = ?`;
					const [deleted] = await conn.execute<ResultSetHeader>(delete_stmt, [
						id,
					]);
					conn.release();

					if (!deleted) {
						throw new HTTPError(500, 'Book not deleted');
					}
					return {
						message: 'Book deleted successfully',
					};
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
				},
			),
	);
