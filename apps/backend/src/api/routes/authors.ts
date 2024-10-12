import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { AuthorPublic, AuthorsPublic } from '@/schemas/authors';
import { BooksPublic } from '@/schemas/books';
import { Message } from '@/schemas/message';
import { OffsetBasedPagination } from '@/schemas/query';
import type { AuthorRow } from '@/types/authors';
import type { BookRow } from '@/types/books';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

export const router = new Elysia({
	prefix: '/authors',
	tags: ['authors'],
})
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			SELECT
				authors.id AS id,
				authors.name AS name
			FROM
				authors
			LIMIT ?
			OFFSET ?;
			`;
			const [results] = await conn.execute<AuthorRow[]>(stmt, [
				limit.toString(),
				offset.toString(),
			]);
			conn.release();
			return {
				count: 1,
				data: results,
			};
		},
		{
			query: OffsetBasedPagination,
			response: {
				200: AuthorsPublic,
			},
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();

			const stmt = `
			SELECT
				authors.id AS id,
				authors.name AS name
			FROM
				authors
			WHERE
				id = ?;
			`;
			const [results] = await conn.execute<AuthorRow[]>(stmt, [id]);
			conn.release();

			if (!results.length) {
				throw new HTTPError(404, 'Author not found');
			}

			return results[0];
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			response: {
				200: AuthorPublic,
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

					// TODO: transaction

					try {
						const stmt = `
						INSERT INTO authors
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
						await conn.execute<ResultSetHeader>(stmt, [uuidv7(), name]);
					} catch (error) {
						if (error instanceof Error) {
							const code = 'code' in error ? error.code : undefined;
							if (code === 'ER_DUP_ENTRY') {
								throw new HTTPError(409, 'Author already exists');
							}
						}

						throw error;
					} finally {
						conn.release();
					}

					set.status = 201;
					return { message: 'Author created' };
				},
				{
					body: t.Object({
						name: t.String({ minLength: 1, maxLength: 255 }),
					}),
					response: {
						201: Message,
						409: Message,
					},
				},
			)
			.patch(
				'/:id',
				async ({ params: { id }, body: { name } }) => {
					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						const authorStmt = `
						SELECT
							*
						FROM
							authors
						WHERE
							id = ?;`;
						const [updateAuthor] = await conn.execute<RowDataPacket[]>(
							authorStmt,
							[id],
						);
						if (!updateAuthor.length) {
							throw new HTTPError(404, 'Author not found');
						}

						const update_author_stmt = `
						UPDATE
							authors
						SET
							name = ?
						WHERE
							id = ?;
						`;
						const updated = await conn.execute<ResultSetHeader>(
							update_author_stmt,
							[name, id],
						);
						console.log(updated);
						// TODO: check something from updated

						await conn.commit();
					} catch (error) {
						await conn.rollback();

						// TODO: remove duplicate code
						if (error instanceof Error) {
							const code = 'code' in error ? error.code : undefined;
							if (code === 'ER_DUP_ENTRY') {
								throw new HTTPError(409, 'Author already exists');
							}
						}

						throw error;
					} finally {
						conn.release();
					}

					return { message: 'Author updated successfully' };
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
						409: Message,
					},
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						const authorStmt = `
						SELECT
							*
						FROM
							authors
						WHERE
							id = ?`;
						const [deleteAuthor] = await conn.execute<RowDataPacket[]>(
							authorStmt,
							[id],
						);
						if (!deleteAuthor.length) {
							throw new HTTPError(404, 'Author not found');
						}

						const deleteAuthorStmt = `
						DELETE FROM
							authors 
						WHERE 
							id = ?
						`;
						await conn.execute<ResultSetHeader>(deleteAuthorStmt, [id]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					return { message: 'Author deleted successfully' };
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
	// get books by author
	.get(
		'/:id/books',
		async ({ params: { id: author_id }, query: { limit, offset } }) => {
			// TODO: remove duplicate code

			const conn = await pool.getConnection();

			// TODO: transaction

			const author_stmt = `
			SELECT
				*
			FROM
				authors
			WHERE
				id = ?;
			`;
			const [author_results] = await conn.execute<BookRow[]>(author_stmt, [
				author_id,
			]);

			if (!author_results.length) {
				conn.release();

				throw new HTTPError(404, 'Author not found');
			}

			await conn.beginTransaction();

			// TODO: set isolation level

			const count_stmt = 'SELECT COUNT(*) AS count FROM books';
			const [count_results] =
				await conn.execute<(RowDataPacket & { count: number })[]>(count_stmt);
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
			GROUP BY
				book.id
			HAVING
				JSON_CONTAINS(authors, JSON_OBJECT('id', ?))
			LIMIT ? OFFSET ?;
			`;
			const [book_results] = await conn.execute<BookRow[]>(book_stmt, [
				author_id,
				limit.toString(),
				offset.toString(),
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
			query: OffsetBasedPagination,
			response: {
				200: BooksPublic,
			},
		},
	);

// TODO: ahh create a new route for it? or just use query params? in books route
