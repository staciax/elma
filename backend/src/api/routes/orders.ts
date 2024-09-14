import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { currentUser, superuser } from '@/plugins/auth';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

export const router = new Elysia({
	prefix: '/orders',
	tags: ['orders'],
})
	.guard((app) =>
		app
			.use(superuser())
			.get(
				'/',
				async ({ query: { limit, offset } }) => {
					const conn = await pool.getConnection();
					// TODO: remove * from SELECT
					const stmt = `
					SELECT
						*
					FROM
						orders
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
			.get('/:id', async ({ params: { id } }) => {
				const conn = await pool.getConnection();

				const stmt = `
				SELECT
					*
				FROM
					orders
				WHERE
					id = ?;
				`;
				const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
				if (!results.length) {
					conn.release();
					throw new HTTPError(404, 'Order not found');
				}
				conn.release();
				return results;
			})
			.post(
				'/',
				async ({ set, body }) => {
					const conn = await pool.getConnection();
					const stmt = `
					INSERT INTO orders
					(
						id	
					)
					VALUES
					(	
						?
					);
					`;
					// await conn.query<ResultSetHeader>(stmt, [uuidv7()]);
					conn.release();

					set.status = 201;
					return { message: 'Order created' };
				},
				{
					body: t.Object({}),
				},
			)
			.patch(
				'/:id',
				async ({ body, params: { id } }) => {
					const conn = await pool.getConnection();
					const orderStmt = `
					SELECT
						*
					FROM
						orders
					WHERE
						id = ?`;
					const [updateOrder] = await conn.query<RowDataPacket[]>(orderStmt, [
						id,
					]);
					if (!updateOrder.length) {
						conn.release();
						throw new HTTPError(404, 'Order not found');
					}

					// TODO: update order

					conn.release();

					return { message: 'Order updated successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					body: t.Object({}),
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					const orderStmt = `
					SELECT
						*
					FROM
						orders
					WHERE
						id = ?`;
					const [deleteOrder] = await conn.query<RowDataPacket[]>(orderStmt, [
						id,
					]);
					if (!deleteOrder.length) {
						conn.release();
						throw new HTTPError(404, 'Order not found');
					}

					const deleteOrderStmt = `
					DELETE FROM
						orders 
					WHERE 
						id = ?
					`;
					await conn.execute<ResultSetHeader>(deleteOrderStmt, [id]);
					conn.release();

					return { message: 'Order deleted successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
				},
			),
	)
	.guard((app) =>
		app
			.use(currentUser())
			.get('/me', async ({ user, query: { limit, offset } }) => user, {
				query: t.Object({
					limit: t.Optional(t.Number({ minimum: 1, default: 100 })),
					offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
				}),
			})
			.get('/me/:id', async ({ params: { id }, user }) => [id, user], {
				params: t.Object({
					id: t.String({ format: 'uuid' }),
				}),
			}),
	);
// TODO: order me routes
