import { pool } from '@/db';
import { UserRoles } from '@/enums';
import { HTTPError } from '@/errors';
import { currentUser, superuser } from '@/plugins/auth';
import { Message } from '@/schemas/message';
import { OrderCreate, OrderPublic, OrdersPublic } from '@/schemas/orders';
import { OffsetBasedPagination } from '@/schemas/query';
import type { OrderRow } from '@/types/orders';
import type { UserRow } from '@/types/users';

import { Elysia, t } from 'elysia';
import { type ResultSetHeader, type RowDataPacket, format } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

// TODO: Ebook ที่ซื้อแล้ว ไม่สามารถซื้อซ้ำได้

enum _OrderStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export const router = new Elysia({
	prefix: '/orders',
	tags: ['orders'],
})
	.guard((app) =>
		app
			.use(currentUser)
			.get(
				'/',
				async ({ user, query: { limit, offset } }) => {
					const conn = await pool.getConnection();
					const stmt = `
					SELECT
						orders.id AS id,
						orders.user_id AS user_id,
						orders.total_price AS total_price,
						orders.status AS status,
						orders.created_at AS created_at,
						orders.updated_at AS updated_at,

						IF(COUNT(order_items.order_id) = 0, NULL,
							JSON_ARRAYAGG(
								JSON_OBJECT(
									'order_id', order_items.order_id,
									'book_id', order_items.book_id,
									'price', CAST(order_items.price AS CHAR)
								)
							)
						) AS items

					FROM
						orders
					LEFT JOIN
						order_items ON orders.id = order_items.order_id
					${user.role === UserRoles.MEMBER ? 'WHERE orders.user_id = ?' : ''}
					GROUP BY
						orders.id
					LIMIT ?
					OFFSET ?;
					`;

					// const values = [limit.toString(), offset.toString()];
					// if (user.role === 'MEMBER') {
					// 	values.unshift(user.id);
					// }

					const values = (
						user.role === UserRoles.MEMBER ? [user.id] : []
					).concat([limit.toString(), offset.toString()]);

					const [orders] = await conn.execute<OrderRow[]>(stmt, values);

					return {
						count: orders.length,
						data: orders,
					};
				},
				{
					query: OffsetBasedPagination,
					response: {
						200: OrdersPublic,
					},
				},
			)
			.get(
				'/:id',
				async ({ user, params: { id } }) => {
					// TODO: check if user is the owner of the order

					const conn = await pool.getConnection();

					const stmt = `
					SELECT
						orders.id AS id,
						orders.user_id AS user_id,
						orders.total_price AS total_price,
						orders.status AS status,
						orders.created_at AS created_at,
						orders.updated_at AS updated_at,

						IF(COUNT(order_items.order_id) = 0, NULL,
							JSON_ARRAYAGG(
								JSON_OBJECT(
									'order_id', order_items.order_id,
									'book_id', order_items.book_id,
									'price', CAST(order_items.price AS CHAR)
								)
							)
						) AS items

					FROM
						orders
					JOIN
						order_items ON orders.id = ? 
					WHERE
						orders.user_id = ?
					GROUP BY
						orders.id;
					`;
					// orders.user_id = ? should be on WHERE vs JOIN ?
					// WHERE orders.id = ? AND orders.user_id = ?
					// WHERE orders.id = ? ${user.role === 'MEMBER' ? 'AND orders.user_id = ?' : ''};

					// console.log(format(stmt, [id, user.id]));

					const [orders] = await conn.execute<OrderRow[]>(stmt, [id, user.id]);

					conn.release();

					if (!orders.length) {
						throw new HTTPError(404, 'Order not found');
					}

					return orders[0];
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					response: OrderPublic,
				},
			),
	)
	.guard((app) =>
		app
			.use(superuser())
			.post(
				'/',
				async ({ set, body }) => {
					const { user_id, total_price, status } = body;

					const conn = await pool.getConnection();

					try {
						await conn.beginTransaction();

						// check if user exists
						const user_stmt = `
						SELECT
							*
						FROM
							users
						WHERE
							id = ?;
						`;
						const [user_results] = await conn.execute<UserRow[]>(user_stmt, [
							user_id,
						]);
						if (!user_results.length) {
							throw new HTTPError(404, 'User not found');
						}
						const user = user_results[0];

						// check user role
						if (user.role !== UserRoles.MEMBER) {
							throw new HTTPError(403, 'Only member can create order');
						}

						// create order
						const order_stmt = `
						INSERT INTO orders
						(
							id,
							user_id,
							total_price,
							status
						)
						VALUES (
							?,
							?,
							?,
							?
						);
						`;
						// create order

						await conn.execute<ResultSetHeader>(order_stmt, [
							uuidv7(),
							user.id,
							total_price,
							status,
						]);

						await conn.commit();

						set.status = 201;
						return { message: 'Order created' };
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						// TODO: mysql error handling
						throw error;
					} finally {
						conn.release();
					}
				},
				{
					body: OrderCreate,
					response: {
						201: Message,
					},
				},
			)
			.patch(
				'/:id',
				async ({ params: { id } }) => {
					// TODO: transaction and update order
					const conn = await pool.getConnection();
					conn.release();
					return { message: `Order ${id} updated` };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
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

					try {
						await conn.beginTransaction();

						const order_stmt = `
						SELECT
							*
						FROM
							orders
						WHERE
							id = ?;
						`;
						const [order] = await conn.execute<RowDataPacket[]>(order_stmt, [
							id,
						]);
						if (!order.length) {
							throw new HTTPError(404, 'Order not found');
						}

						const order_delete_stmt = `
						DELETE FROM orders
						WHERE
							id = ?;
						`;
						await conn.execute<ResultSetHeader>(order_delete_stmt, [id]); // TODO: or execute ?
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					} finally {
						conn.release();
					}

					return { message: 'Order deleted' };
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
	// create order items
	.guard((app) => app)

	// me routes
	.guard((app) => app);

// .guard((app) =>
// 	app
// 		.use(currentUser())
// 		.get(
// 			'/me',
// 			async ({ user, query: { limit, offset } }) => {
// 				return user;
// 			},
// 			{
// 				query: t.Object({
// 					limit: t.Number({ minimum: 1, default: 100 }),
// 					offset: t.Number({ minimum: 0, default: 0 }),
// 				}),
// 			},
// 		)
// 		.post(
// 			'/me',
// 			async ({ user }) => {
// 				const conn = await pool.getConnection();

// 				try {
// 					await conn.beginTransaction();

// 					const cart_stmt = `
// 					SELECT
// 						*
// 					FROM
// 						shopping_carts
// 					WHERE
// 						user_id = ?
// 					`;

// 					const [cart_resutls] = await conn.execute<
// 						(RowDataPacket & {
// 							user_id: string;
// 							book_id: string;
// 						})[]
// 					>(cart_stmt, [user.id]);

// 					if (!cart_resutls.length) {
// 						throw new HTTPError(400, 'cart empty');
// 					}

// 					const order_id = uuidv7();

// 					const create_order_stmt = `
// 					INSERT INTO orders
// 					(
// 						id,
// 						user_id,
// 						total_price,
// 						status
// 					)
// 					VALUES
// 					(
// 						?,
// 						?,
// 						?,
// 						?
// 					);
// 					`;

// 					await conn.execute<ResultSetHeader>(create_order_stmt, [
// 						order_id,
// 						user.id,
// 						500,
// 						'PENDING',
// 					]);

// 					const create_order_items_stmt = `
// 					INSERT INTO order_items
// 					(
// 						order_id,
// 						book_id,
// 						price
// 					)
// 					VALUES
// 					(
// 						?,
// 						?,
// 						?
// 					);
// 					`;

// 					// await conn.execute<ResultSetHeader>(create_order_items_stmt, [
// 					// 	[order_id, '01920129-d06e-722c-a123-1b96396b0389', 100],
// 					// 	[order_id, '01920129-ea46-7eea-ac76-f871bc56cfe9', 200],
// 					// ]);
// 					await conn.execute<ResultSetHeader>(create_order_items_stmt, [
// 						order_id,
// 						'01920129-d06e-722c-a123-1b96396b0389',
// 						100,
// 					]);

// 					// await conn.commit();
// 					await conn.rollback();

// 					return {
// 						message: 'Create order successfully',
// 					};
// 				} catch (error) {
// 					await conn.rollback();
// 					// TODO: error handling
// 					throw error;
// 				} finally {
// 					conn.release();
// 				}
// 			},
// 			{},
// 		)
// 		.get('/me/:id', async ({ params: { id }, user }) => [id, user], {
// 			params: t.Object({
// 				id: t.String({ format: 'uuid' }),
// 			}),
// 		}),
// );
// TODO: order me routes
