import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { currentUser, superuser } from '@/plugins/auth';
import type { OrderRowPacketData } from '@/schemas/orders';

import { Elysia, t } from 'elysia';
import { type ResultSetHeader, type RowDataPacket, format } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

enum OrderStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export const router = new Elysia({
	prefix: '/telne',
	detail: {
		hide: true,
	},
})
	.use(currentUser())
	.get(
		'/orders',
		async () => {
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
                            'price', order_items.price
						)
					)
				) AS items

            FROM
                orders
            LEFT JOIN
                order_items ON orders.id = order_items.order_id
            GROUP BY
                orders.id;
            `;

			const [orders] = await conn.query<OrderRowPacketData[]>(stmt);

			return {
				data: orders,
			};
		},
		{},
	)
	.get(
		'/orders/:id',
		async ({ params: { id } }) => {
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
                            'price', order_items.price
						)
					)
				) AS items

            FROM
                orders
            LEFT JOIN
                order_items ON orders.id = order_items.order_id
			WHERE
				orders.id = ?;
            GROUP BY
                orders.id;
            `;

			const [orders] = await conn.query<OrderRowPacketData[]>(stmt, [id]);
			conn.release();

			if (!orders.length) {
				throw new HTTPError(404, 'Order not found');
			}

			return {
				data: orders[0],
			};
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.post(
		'/orders',
		async ({ user }) => {
			const conn = await pool.getConnection();

			// TODO: refresh user cart before creating order
			// check status of books in cart

			try {
				await conn.beginTransaction();

				// read books from shopping carts
				const cart_stmt = `
				SELECT
					books.id AS id,
					books.price AS price,
					books.is_active AS is_active
				FROM
					shopping_carts
				JOIN
					books ON shopping_carts.book_id = books.id
				WHERE
					user_id = ?
				`;
				const [cart] = await conn.query<
					(RowDataPacket & {
						id: string;
						price: string;
						is_active: string; // TODO: someting for is_active
					})[]
				>(cart_stmt, [user.id]);

				if (!cart.length) {
					throw new HTTPError(400, 'No items in shopping cart');
				}

				const order_id = uuidv7();
				// TODO: decimal js for price calculation or something

				// let total_price = 0;
				// for (const book of cart) {
				// 	total_price += Number.parseFloat(book.price);
				// }

				// thanks for https://stackoverflow.com/a/43363105/19394867
				const total_price = cart.reduce(
					(acc, book) => acc + Number.parseFloat(book.price),
					0,
				);

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

				await conn.query<ResultSetHeader>(order_stmt, [
					order_id,
					user.id,
					total_price,
					'PENDING',
				]);
				// TODO: enum for order status

				// create order details

				// TODO: multiple insertions
				// https://www.geeksforgeeks.org/mysql-insert-multiple-rows/
				// https://stackoverflow.com/a/74846861/19394867

				const orderDetails_stmt = `
				INSERT INTO order_items
				(
					order_id,
					book_id,
					price
				)
				VALUES ?;
				`;

				// bulk insert
				// thanks for https://github.com/sidorares/node-mysql2/issues/1244
				const values = cart.map((book) => [order_id, book.id, book.price]);

				// console.log(format(orderDetails_stmt, [values]));

				const [results] = await conn.query<ResultSetHeader>(orderDetails_stmt, [
					values,
				]);

				console.log(results);
				if (results.affectedRows !== cart.length) {
					throw new HTTPError(500, 'Failed to create order');
				}

				// VALUES ${'(?,?,?),'.repeat(cart.length).slice(0, -1)};
				// thanks for https://stackoverflow.com/questions/36094865/how-to-do-promise-all-for-array-of-array-of-promises
				// const promises = await Promise.all(
				// 	cart.map(async (book) => {
				// 		return await conn.query<ResultSetHeader>(orderDetails_stmt, [
				// 			order_id,
				// 			book.id,
				// 			book.price,
				// 		]);
				// 	}),
				// );

				// try selecting the order

				const order_selected_stmt = `
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
								'price', order_items.price
							)
						)
					) AS items

				FROM
					orders
				LEFT JOIN
					order_items ON orders.id = order_items.order_id
				WHERE
					orders.id = ?
				GROUP BY
					orders.id;
				`;

				const [selectedOrder] = await conn.query<OrderRowPacketData[]>(
					order_selected_stmt,
					[order_id],
				);
				if (!selectedOrder.length) {
					await conn.rollback();
					throw new HTTPError(400, 'Order not found');
				}

				await conn.rollback();
				// await conn.commit();

				return {
					data: selectedOrder[0],
				};

				// return { message: cart };
			} catch (error) {
				// TODO: error handling and logging?
				await conn.rollback();
				throw error;
			} finally {
				console.log('Connection released');
				conn.release();
			}
			// return { message: 'test' };
		},
		{},
	)
	.guard((app) =>
		app
			.use(superuser())
			.patch(
				'/orders/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();
					conn.release();
					return { message: `Order ${id} updated` };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
				},
			)
			.delete(
				'/orders/:id',
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
						const [order] = await conn.query<RowDataPacket[]>(order_stmt, [id]);
						if (!order.length) {
							throw new HTTPError(404, 'Order not found');
						}

						const order_delete_stmt = `
						DELETE FROM orders
						WHERE
							id = ?;
						`;
						await conn.query<ResultSetHeader>(order_delete_stmt, [id]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
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
				},
			),
	)
	.get(
		'/orders/:id/items',
		async () => {
			const conn = await pool.getConnection();
			conn.release();
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.get(
		'/orders/:id/items/:item_id',
		async () => {
			const conn = await pool.getConnection();
			conn.release();
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
				item_id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.post(
		'/orders/:id/items',
		async () => {
			const conn = await pool.getConnection();
			conn.release();
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.patch(
		'/orders/:id/items/:item_id',
		async () => {
			const conn = await pool.getConnection();
			conn.release();
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
				item_id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.delete(
		'/orders/:id/items/:item_id',
		async () => {
			const conn = await pool.getConnection();
			conn.release();
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
				item_id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.guard((app) =>
		app
			.use(currentUser())
			.get(
				'/orders/me',
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
									'price', order_items.price
								)
							)
						) AS items
					FROM
						orders
					LEFT JOIN
						order_items ON orders.id = order_items.order_id
					WHERE
						orders.user_id = ?
					GROUP BY
						orders.id
					LIMIT ?
					OFFSET ?;
					`;

					const [orders] = await conn.query<OrderRowPacketData[]>(stmt, [
						user.id,
						limit,
						offset,
					]);
					conn.release();

					return { data: orders };
				},
				{
					query: t.Object({
						limit: t.Number({ minimum: 1, default: 100 }),
						offset: t.Number({ minimum: 0, default: 0 }),
					}),
				},
			)
			.get(
				'/orders/me/:id',
				async ({ params: { id }, user }) => {
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
									'price', order_items.price
								)
							)
						) AS items

					FROM
						orders
					LEFT JOIN
						order_items ON orders.id = order_items.order_id
					WHERE
						orders.id = ? AND orders.user_id = ?
					GROUP BY
						orders.id
					`;

					const [results] = await conn.query<RowDataPacket[]>(stmt, [
						id,
						user.id,
					]);
					conn.release();

					if (!results.length) {
						throw new HTTPError(404, 'Order not found');
					}

					return { data: results[0] };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
				},
			),
	);

// router for my orders
