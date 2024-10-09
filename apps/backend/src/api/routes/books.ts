import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import {
	BookCreate,
	BookPublic,
	type BookRowPacketData,
	BookUpdate,
	BooksPublic,
} from '@/schemas/books';
import { Message } from '@/schemas/message';
import { OffsetBasedPagination } from '@/schemas/query';

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
			query: OffsetBasedPagination,
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
			WHERE
				book.id = ?
			GROUP BY book.id;
			`;
			// TODO: join book_images

			const [results] = await conn.query<BookRowPacketData[]>(stmt, [id]);
			conn.release();
			if (!results.length) {
				throw new HTTPError(404, 'Book not found');
			}
			return results[0];
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			response: {
				200: BookPublic,
			},
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
						physical_price,
						published_date,
						cover_image,
						is_active,
						publisher_id,
						category_id,
					},
				}) => {
					// TODO: make function for get publisher, category, series, authors

					const conn = await pool.getConnection();

					// TODO: try catch ?

					await conn.beginTransaction();

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
						conn.release();
						throw new HTTPError(404, 'Publisher not found');
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
						conn.release();
						throw new HTTPError(404, 'Category not found');
					}

					// // TODO: author_ids? for book_authors?
					// const author_ids: string[] = [];
					// for (const author_id of author_ids) {
					// 	const author_stmt = `
					// 	SELECT
					// 		*
					// 	FROM
					// 		authors
					// 	WHERE
					// 		id = ?`;
					// 	const [author] = await conn.query<RowDataPacket[]>(author_stmt, [
					// 		author_id,
					// 	]);
					// 	if (!author.length) {
					// 		conn.release();
					// 		throw new HTTPError(404, `Author ${author_id} not found`);
					// 	}
					// }

					try {
						const book_stmt = `
						INSERT INTO books (
							id,
							title,
							description,
							isbn,
							price,
							physical_price,
							published_date,
							cover_image,
							is_active,
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
							physical_price,
							published_date,
							cover_image,
							is_active,
							publisher_id,
							category_id,
						]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					// TODO: refresh book and return book data
					set.status = 201;
					return { message: 'Book created successfully' };
				},
				{
					body: BookCreate,
					response: {
						201: Message,
					},
				},
			)
			.patch(
				'/:id',
				async ({
					params: { id },
					body: {
						title,
						description,
						isbn,
						price,
						physical_price,
						published_date,
						cover_image,
						is_active,
						publisher_id,
						category_id,
					},
				}) => {
					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						const book_stmt = `
						SELECT
							*
						FROM
							books
						WHERE
							id = ?`;

						const [results] = await conn.query<RowDataPacket[]>(book_stmt, [
							id,
						]);
						if (!results.length) {
							throw new HTTPError(404, 'Book not found');
						}

						const columns = [];
						const values = [];

						// TODO: should be check every field is not undefined?

						if (title) {
							columns.push('title = ?');
							values.push(title);
						}

						if (description) {
							columns.push('description = ?');
							values.push(description);
						}

						if (isbn) {
							columns.push('isbn = ?');
							values.push(isbn);
						}

						if (price) {
							columns.push('price = ?');
							values.push(price);
						}

						if (physical_price) {
							columns.push('physical_price = ?');
							values.push(physical_price);
						}

						if (published_date) {
							columns.push('published_date = ?');
							values.push(published_date);
						}

						if (cover_image) {
							columns.push('cover_image = ?');
							values.push(cover_image);
						}

						if (is_active !== undefined) {
							columns.push('is_active = ?');
							values.push(is_active);
						}

						if (publisher_id) {
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
							if (!publisher.length) {
								throw new HTTPError(404, 'Publisher not found');
							}

							columns.push('publisher_id = ?');
							values.push(publisher_id);
						}

						if (category_id) {
							const category_stmt = `
							SELECT
								*
							FROM
								categories
							WHERE
								id = ?`;
							const [category] = await conn.query<RowDataPacket[]>(
								category_stmt,
								[category_id],
							);
							if (!category.length) {
								throw new HTTPError(404, 'Category not found');
							}

							columns.push('category_id = ?');
							values.push(category_id);
						}

						const update_stmt = `
						UPDATE
							books
						SET
							${columns.join(', ')}
						WHERE
							id = ?`;

						await conn.execute<ResultSetHeader>(update_stmt, [...values, id]);
						await conn.commit();
					} catch (error) {
						// TODO: error handling
						await conn.rollback();
						throw error;
					} finally {
						conn.release();
					}
					// console.log(columns.join(', '));

					return { message: 'Book updated successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					body: BookUpdate,
					response: {
						200: Message,
					},
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						const book_stmt = `
						SELECT
							*
						FROM
							books
						WHERE
							id = ?
						`;
						const [results] = await conn.query<RowDataPacket[]>(book_stmt, [
							id,
						]);

						if (!results.length) {
							throw new HTTPError(404, 'Book not found');
						}

						const delete_stmt = `
						DELETE
						FROM
							books
						WHERE
							id = ?`;
						const [deleted] = await conn.execute<ResultSetHeader>(delete_stmt, [
							id,
						]);
						if (!deleted) {
							throw new HTTPError(500, 'Book not deleted');
						}
					} catch (error) {
						// TODO: error handling
						await conn.rollback();
						throw error;
					} finally {
						conn.release();
					}

					return {
						message: 'Book deleted successfully',
					};
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
	);
