import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { BooksPublic } from '@/schemas/books';
import { CategoriesPublic, CategoryPublic } from '@/schemas/categories';
import { OffsetBasedPagination } from '@/schemas/query';
import type { BookRowPacketData } from '@/types/books';
import type { CategoryRowPacketData } from '@/types/categories';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

export const router = new Elysia({
	prefix: '/categories',
	tags: ['categories'],
})
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			SELECT
				categories.id AS id,
				categories.name AS name
			FROM
				categories
			LIMIT ?
			OFFSET ?;
			`;
			const [results] = await conn.execute<CategoryRowPacketData[]>(stmt, [
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
				200: CategoriesPublic,
			},
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();

			const stmt = `
			SELECT
				categories.id AS id,
				categories.name AS name
			FROM
				categories
			WHERE id = ?;
			`;
			const [results] = await conn.execute<CategoryRowPacketData[]>(stmt, [id]);
			conn.release();

			if (!results.length) {
				throw new HTTPError(404, 'Category not found');
			}

			return results[0];
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			response: {
				200: CategoryPublic,
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

					const stmt = `
					INSERT INTO categories
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
					conn.release();

					set.status = 201;
					return { message: 'Category created' };
				},
				{
					body: t.Object({
						name: t.String({ minLength: 1, maxLength: 255 }),
					}),
				},
			)
			.patch(
				'/:id',
				async ({ params: { id }, body: { name } }) => {
					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						const categoryStmt = `
						SELECT
							*
						FROM
							categories
						WHERE
							id = ?`;
						const [updateCategory] = await conn.execute<RowDataPacket[]>(
							categoryStmt,
							[id],
						);

						if (!updateCategory.length) {
							throw new HTTPError(404, 'Category not found');
						}

						const updateCategoryStmt = `
						UPDATE categories
						SET
							name = ?
						WHERE
							id = ?
						`;
						await conn.execute<ResultSetHeader>(updateCategoryStmt, [name, id]);

						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					return { message: 'Category updated successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					body: t.Object({
						name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
					}),
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						const categoryStmt = `
						SELECT
							*
						FROM
							categories
						WHERE
							id = ?
						`;
						const [deleteCategory] = await conn.execute<RowDataPacket[]>(
							categoryStmt,
							[id],
						);
						if (!deleteCategory.length) {
							conn.release();
							throw new HTTPError(404, 'Category not found');
						}

						const deleteCategoryStmt = `
						DELETE FROM
							categories 
						WHERE 
							id = ?
						`;
						await conn.execute<ResultSetHeader>(deleteCategoryStmt, [id]);
						conn.release();
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					return { message: 'Category deleted successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
				},
			),
	)
	// get products by category
	.get(
		'/:id/books',
		async ({ params: { id: category_id }, query: { limit, offset } }) => {
			// TODO: remove duplicate code

			const conn = await pool.getConnection();

			// TODO: transaction

			const catetory_stmt = `
			SELECT
				*
			FROM
				categories
			WHERE
				id = ?;
			`;
			const [catetory_results] = await conn.execute<BookRowPacketData[]>(
				catetory_stmt,
				[category_id],
			);

			if (!catetory_results.length) {
				conn.release();

				throw new HTTPError(404, 'Catetory not found');
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
				JSON_CONTAINS(category, JSON_OBJECT('id', ?))
			LIMIT ? OFFSET ?;
			`;
			const [book_results] = await conn.execute<BookRowPacketData[]>(
				book_stmt,
				[category_id, limit.toString(), offset.toString()],
			);

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
