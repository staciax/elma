import { pool } from '@/db';
import { superuser } from '@/plugins/auth';
import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

export const router = new Elysia({
	prefix: '/authors',
	tags: ['authors'],
})
	.use(superuser())
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			SELECT
				*
			FROM
				authors
			LIMIT ?
			OFFSET ?;
			`;
			const [results] = await conn.query(stmt, [limit, offset]);
			conn.release();
			return results;
		},
		{
			query: t.Object({
				limit: t.Optional(t.Number({ default: 100 })),
				offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
			}),
		},
	)
	.get(
		'/:id',
		async ({ set, params: { id } }) => {
			const conn = await pool.getConnection();

			const stmt = `
			SELECT
				*
			FROM
				authors
			WHERE
				id = ?;
			`;
			const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
			if (!results.length) {
				conn.release();
				set.status = 404;
				return { message: 'Author not found' };
			}
			conn.release();
			return results;
		},
		{
			query: t.Object({
				limit: t.Optional(t.Number({ default: 100 })),
				offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
			}),
		},
	)
	.post(
		'/',
		async ({ set, body: { first_name, last_name } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			INSERT INTO authors
			(	
				id,
				first_name,
				last_name
			)
			VALUES
			(	
				?,
				?,
				?
			);
			`;
			await conn.query<ResultSetHeader>(stmt, [
				uuidv7(),
				first_name,
				last_name,
			]);
			conn.release();

			set.status = 201;
			return { message: 'Author created' };
		},
		{
			body: t.Object({
				first_name: t.String({ minLength: 1, maxLength: 255 }),
				last_name: t.String({ minLength: 1, maxLength: 255 }),
			}),
		},
	)
	.patch(
		'/:id',
		async ({ set, params: { id }, body: { first_name, last_name } }) => {
			console.log(first_name, last_name);
			const conn = await pool.getConnection();
			const authorStmt = `
			SELECT
				*
			FROM
				authors
			WHERE
				id = ?`;
			const [updateAuthor] = await conn.query<RowDataPacket[]>(authorStmt, [
				id,
			]);
			if (!updateAuthor.length) {
				conn.release();
				set.status = 404;
				return { message: 'Author not found' };
			}

			// TODO: update author

			conn.release();

			return { message: 'Author updated successfully' };
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			body: t.Object({
				first_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
				last_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
			}),
		},
	)
	.delete(
		'/:id',
		async ({ set, params: { id } }) => {
			const conn = await pool.getConnection();

			const authorStmt = `
			SELECT
				*
			FROM
				authors
			WHERE
				id = ?`;
			const [deleteAuthor] = await conn.query<RowDataPacket[]>(authorStmt, [
				id,
			]);
			if (!deleteAuthor.length) {
				conn.release();
				set.status = 404;
				return { message: 'Author not found' };
			}

			const deleteAuthorStmt = `
			DELETE FROM
				authors 
			WHERE 
				id = ?
			`;
			await conn.execute<ResultSetHeader>(deleteAuthorStmt, [id]);
			conn.release();

			return { message: 'Author deleted successfully' };
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	);
