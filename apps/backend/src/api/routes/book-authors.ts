import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { AuthorPublic, type AuthorRowPacketData } from '@/schemas/authors';
import { Message } from '@/schemas/message';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

// NOTE: i can't use `book_id` it error like this: `because a route already exists with a different parameter name ("id") in the same location"`

export const router = new Elysia({
	// prefix: '/book-authors',
	tags: ['books'],
})
	// .get(
	// 	'/',
	// 	async ({ params: { id: book_id }, query: { limit, offset } }) => {
	// 		const conn = await pool.getConnection();

	// 		const stmt = `
	// 		SELECT
	// 			authors.id AS id,
	// 			authors.name AS name
	// 		FROM
	// 			authors
	// 		JOIN book_authors ON authors.id = book_authors.author_id
	// 		WHERE
	// 			book_authors.book_id = ?
	// 		LIMIT ?
	// 		OFFSET ?;
	// 		`;
	// 		const [results] = await conn.query(stmt, [book_id, limit, offset]);
	// 		conn.release();

	// 		return { data: results };
	// 	},
	// 	{
	// 		params: t.Object({
	// 			id: t.String({ format: 'uuid' }),
	// 		}),
	// 		query: t.Object({
	// 			limit: t.Number({ minimum: 1, default: 100 }),
	// 			offset: t.Number({ minimum: 0, default: 0 }),
	// 		}),
	// 	},
	// )
	.get(
		'/books/:id/authors/:author_id',
		async ({ params: { id: book_id, author_id } }) => {
			const conn = await pool.getConnection();

			const book_stmt = `
			SELECT
				*
			FROM
				books
			WHERE
				id = ?;`;

			const [book_results] = await conn.query<RowDataPacket[]>(book_stmt, [
				book_id,
			]);
			if (!book_results.length) {
				conn.release();
				throw new HTTPError(404, 'Book not found');
			}

			const author_stmt = `
			SELECT
				*
			FROM
				authors
			WHERE
				id = ?;`;
			const [author_results] = await conn.query<AuthorRowPacketData[]>(
				author_stmt,
				[author_id],
			);

			if (!author_results.length) {
				conn.release();
				throw new HTTPError(404, 'Author not found');
			}

			// const stmt = `
			// SELECT
			// 	authors.id AS id,
			// 	authors.name AS name
			// FROM
			// 	authors
			// JOIN book_authors ON authors.id = book_authors.author_id
			// WHERE
			// 	book_authors.book_id = ? AND book_authors.author_id = ?;
			// `;

			// const [author_results] = await conn.query<AuthorRowPacketData[]>(stmt, [
			// 	book_id,
			// 	author_id,
			// ]);

			// if (!author_results.length) {
			// 	conn.release();
			// 	throw new HTTPError(404, 'Author not found');
			// }

			conn.release();

			return author_results[0];
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
				author_id: t.String({ format: 'uuid' }),
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
				'/books/:id/authors/:author_id',
				async ({ params: { id: book_id, author_id } }) => {
					const conn = await pool.getConnection();

					try {
						// NOTE: ที่ต้องใส่ transaction เพราะ ถ้าเกิด book โดนลบ ระหว่างสร้าง author จะมีปัญหา something like that
						await conn.beginTransaction();

						const book_stmt = `
						SELECT
							*
						FROM
							books
						WHERE
							id = ?;
						`;

						const [book_results] = await conn.query<RowDataPacket[]>(
							book_stmt,
							[book_id],
						);
						if (!book_results.length) {
							throw new HTTPError(404, 'Book not found');
						}

						const author_stmt = `
						SELECT
							*
						FROM
							authors
						WHERE
							id = ?;
						`;
						const [author_results] = await conn.query<RowDataPacket[]>(
							author_stmt,
							[author_id],
						);

						if (!author_results.length) {
							throw new HTTPError(404, 'Author not found');
						}

						const stmt = `
						INSERT INTO
							book_authors (book_id, author_id)
						VALUES
							(?, ?);
						`;
						await conn.query(stmt, [book_id, author_id]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					return {
						message: 'Author added to book',
					};
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
						author_id: t.String({ format: 'uuid' }),
					}),
					response: {
						200: Message,
					},
				},
			)
			// .patch(
			// 	'/:author_id',
			// 	async ({ params: { id: book_id, author_id } }) => {
			// 		const conn = await pool.getConnection();

			// 		conn.release();
			// 	},
			// 	{
			// 		params: t.Object({
			// 			id: t.String({ format: 'uuid' }),
			// 			author_id: t.String({ format: 'uuid' }),
			// 		}),
			// 	},
			// )
			.delete(
				'/books/:id/authors/:author_id',
				async ({ params: { id: book_id, author_id } }) => {
					const conn = await pool.getConnection();

					try {
						// NOTE: ที่ต้องใส่ transaction เพราะ ถ้าเกิด book โดนลบ ระหว่างสร้าง author จะมีปัญหา something like that
						await conn.beginTransaction();

						const book_stmt = `
						SELECT
							*
						FROM
							books
						WHERE
							id = ?;
						`;

						const [book_results] = await conn.query<RowDataPacket[]>(
							book_stmt,
							[book_id],
						);
						if (!book_results.length) {
							throw new HTTPError(404, 'Book not found');
						}

						const author_stmt = `
						SELECT
							*
						FROM
							authors
						WHERE
							id = ?;
						`;
						const [author_results] = await conn.query<RowDataPacket[]>(
							author_stmt,
							[author_id],
						);

						if (!author_results.length) {
							throw new HTTPError(404, 'Author not found');
						}

						const stmt = `
						DELETE FROM
							book_authors
						WHERE
							book_id = ? AND author_id = ?;
						`;
						await conn.execute<ResultSetHeader>(stmt, [book_id, author_id]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					conn.release();

					return {
						message: 'Author removed from book',
					};
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
						author_id: t.String({ format: 'uuid' }),
					}),
					response: {
						200: Message,
					},
				},
			),
	);
