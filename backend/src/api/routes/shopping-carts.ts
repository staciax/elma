import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { currentUser, superuser } from '@/plugins/auth';
import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
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
						limit: t.Optional(t.Number({ default: 100 })),
						offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
					}),
				},
			)
			.get('/:id', async ({ params: { id } }) => id)
			.post('/', async ({ body }) => body)
			.patch('/:id', async ({ body, params: { id } }) => [id, body])
			.delete('/:id', async ({ params: { id } }) => id),
	)
	.group('/me', (app) =>
		app
			.use(currentUser())
			.get('/', async ({ user }) => {
				const conn = await pool.getConnection();
				const stmt = `
				SELECT
					product.id AS product_id,
					product.title AS product_title,
					product.description AS product_description,
					product.isbn AS product_isbn,
					-- product.price AS product_price,
					product.price AS product_ebook_price,
					product.price AS product_paper_price,
					product.published_date AS product_published_date,

					publisher.id AS publisher_id,
					publisher.name AS publisher_name,

					category.id AS category_id,
					category.name AS category_name
				FROM
					products AS product
				LEFT JOIN
					publishers AS publisher ON product.publisher_id = publisher.id
				LEFT JOIN
					categories AS category ON product.category_id = category.id
				JOIN
					shopping_carts AS cart ON product.id = cart.product_id
				-- LIMIT ? OFFSET ?
				`;
				const [results] = await conn.query(stmt, [user.id]);
				conn.release();
				return results;
			})
			.get('/:id', async ({ params: { id } }) => id)
			.post(
				'/',
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

					const stmt = `
					INSERT INTO shopping_carts(user_id, product_id)
					VALUES (?, ?);
					`;

					await conn.query(stmt, [user.id, product_id]);
					conn.release();

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
			.patch('/:id', async ({ body, params: { id } }) => [id, body])
			.delete('/:id', async ({ params: { id } }) => id),
	);

// TODO: carts me routes
