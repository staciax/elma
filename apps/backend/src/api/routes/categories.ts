import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';

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
			const [results] = await conn.query(stmt, [limit, offset]);
			conn.release();
			return results;
		},
		{
			query: t.Object({
				limit: t.Optional(t.Number({ minimum: 1, default: 100 })),
				offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
			}),
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
			const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
			if (!results.length) {
				conn.release();
				throw new HTTPError(404, 'Category not found');
			}
			conn.release();
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
				async ({ set, body: { name } }) => {
					const conn = await pool.getConnection();
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
					await conn.query<ResultSetHeader>(stmt, [uuidv7(), name]);
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
					console.log(name);
					const conn = await pool.getConnection();
					const categoryStmt = `
					SELECT
						*
					FROM
						categories
					WHERE
						id = ?`;
					const [updateCategory] = await conn.query<RowDataPacket[]>(
						categoryStmt,
						[id],
					);
					if (!updateCategory.length) {
						conn.release();
						throw new HTTPError(404, 'Category not found');
					}

					// TODO: update category

					conn.release();

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

					const categoryStmt = `
					SELECT
						*
					FROM
						categories
					WHERE
						id = ?
					`;
					const [deleteCategory] = await conn.query<RowDataPacket[]>(
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

					return { message: 'Category deleted successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
				},
			),
	);

// TODO: get products by category
