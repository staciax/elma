import { pool } from '@/db';
import { superuser } from '@/plugins/auth';
import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

export const router = new Elysia({
	prefix: '/publishers',
	tags: ['publishers'],
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
				publishers
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
				publishers
			WHERE id = ?;
			`;
			const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
			if (!results.length) {
				conn.release();
				set.status = 404;
				return { message: 'Publisher not found' };
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
		async ({ set, body: { name } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			INSERT INTO publishers
			(	
				id,
				name,
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
		},
	)
	.patch(
		'/:id',
		async ({ set, params: { id }, body: { name } }) => {
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
				set.status = 404;
				return { message: 'Publisher not found' };
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
		},
	)
	.delete(
		'/:id',
		async ({ set, params: { id } }) => {
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
				set.status = 404;
				return { message: 'Publisher not found' };
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
		},
	);
