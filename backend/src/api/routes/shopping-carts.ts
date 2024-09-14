import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { currentUser, superuser } from '@/plugins/auth';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { QueryError } from 'mysql2';

// import { v7 as uuidv7 } from 'uuid';

// TODO: Ebook ที่ซื้อแล้ว ไม่สามารถซื้อซ้ำได้ และ ไม่สามารถเพิ่มเข้าตะกร้าซ้ำได้

export const router = new Elysia({
	prefix: '/carts',
	tags: ['carts'],
})
	.guard((app) =>
		app
			.use(superuser())
			.get(
				'/',
				async ({ query: { limit, offset } }) => {
					const conn = await pool.getConnection();
					const stmt = `
					SELECT
						*
					FROM
						shopping_carts
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
			.get('/:id', async ({ params: { id } }) => id)
			.post('/', async ({ body }) => body)
			// .patch('/:id', async ({ body, params: { id } }) => [id, body])
			.delete('/:id', async ({ params: { id } }) => id),
	)
	.guard((app) =>
		app
			.use(currentUser())
			.get(
				'/me',
				async ({ user, query: { limit, offset } }) => {
					const conn = await pool.getConnection();
					// const stmt = `
					// SELECT
					// 	product.id AS product_id,
					// 	product.title AS product_title,
					// 	product.description AS product_description,
					// 	product.isbn AS product_isbn,
					// 	-- product.price AS product_price,
					// 	product.price AS product_ebook_price,
					// 	product.price AS product_paper_price,
					// 	product.published_date AS product_published_date,

					// 	publisher.id AS publisher_id,
					// 	publisher.name AS publisher_name,

					// 	category.id AS category_id,
					// 	category.name AS category_name
					// FROM
					// 	products AS product
					// LEFT JOIN
					// 	publishers AS publisher ON product.publisher_id = publisher.id
					// LEFT JOIN
					// 	categories AS category ON product.category_id = category.id
					// JOIN
					// 	shopping_carts AS cart ON product.id = cart.product_id
					// -- LIMIT ? OFFSET ?
					// `;
					const sql = `
					SELECT
						products.id AS id,
						products.title AS title,
						products.description AS description,
						products.isbn AS isbn,
						products.price AS price,
						products.physical_price AS physical_price,
						products.published_date AS published_date,
						products.is_active AS is_active,

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
						products
					LEFT JOIN
						publishers AS publisher ON products.publisher_id = publisher.id
					LEFT JOIN
						categories AS category ON products.category_id = category.id
					LEFT JOIN
						product_authors AS product_author ON products.id = product_author.product_id
					LEFT JOIN
						authors AS author ON product_author.author_id = author.id
					JOIN
						shopping_carts AS cart ON products.id = cart.product_id AND cart.user_id = ?
					GROUP BY products.id
					LIMIT ? OFFSET ?;
			`;

					const [results] = await conn.query(sql, [user.id, 100, 0]);
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
			.get('/me/:id', async ({ params: { id } }) => id)
			.post(
				'/me',
				async ({ body: { product_id }, user }) => {
					const conn = await pool.getConnection();

					const productStmt = `
					SELECT
						*
					FROM
						products
					WHERE id = ?;
					`;
					const [productResults] = await conn.query<RowDataPacket[]>(
						productStmt,
						[product_id],
					);
					if (!productResults.length) {
						conn.release();
						throw new HTTPError(404, 'Product not found');
					}

					try {
						await conn.beginTransaction();
						const stmt = `
						INSERT INTO shopping_carts(user_id, product_id)
						VALUES (?, ?);
						`;
						await conn.query<ResultSetHeader>(stmt, [user.id, product_id]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						if (
							error instanceof Error &&
							(error as QueryError).code === 'ER_DUP_ENTRY'
						) {
							throw new HTTPError(400, 'Product already in cart');
						}
						throw error;
					} finally {
						conn.release();
					}

					return {
						message: 'Product added to cart',
					};
				},
				{
					body: t.Object({
						product_id: t.String({ format: 'uuid' }),
					}),
				},
			)
			// .patch('/me/:id', async ({ body, params: { id } }) => [id, body])
			.delete('/me/:id', async ({ params: { id } }) => id),
	);

// TODO: carts me routes
