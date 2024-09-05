import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

// TODO: check sql injection
// TODO: transaction for insert, update, delete
// TODO: remove duplicate code
// TODO: snake_case to camelCase (stmt)
// TOOD: what t.Partial do?

export const router = new Elysia({
	prefix: '/products',
	tags: ['products'],
})
	// TODO: add role-based access control
	.use(superuser())
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();

			const count_stmt = 'SELECT COUNT(*) AS count FROM products';
			const [count_results] = await conn.query<RowDataPacket[]>(count_stmt);
			if (!count_results.length) {
				throw new HTTPError(404, 'Product not found');
			}
			const count = count_results[0].count;

			const product_stmt = `
				SELECT
					product.id AS product_id,
					product.title AS product_title,
					product.description AS product_description,
					product.isbn AS product_isbn,
					product.price AS product_price,
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
				LIMIT ? OFFSET ?
			`;
			// TODO: join product_authors, authors, product_images
			// and then group by?
			const [product_results] = await conn.query<RowDataPacket[]>(
				product_stmt,
				[limit, offset],
			);
			return {
				count: count,
				data: product_results,
			};
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
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();
			const stmt = `
			SELECT
				product.id AS product_id,
				product.title AS product_title,
				product.description AS product_description,
				product.isbn AS product_isbn,
				product.price AS product_price,
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
			WHERE product.id = ?
			`;
			// TODO: join product_authors, authors, product_images

			const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
			conn.release();
			if (!results.length) {
				throw new HTTPError(404, 'Product not found');
			}
			return results;
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	)
	.post(
		'/',
		async ({
			set,
			body: {
				title,
				description,
				isbn,
				price,
				published_date,
				publisher_id,
				category_id,
			},
		}) => {
			// TODO: remove hard-coded values
			// TODO: make function for get publisher, category, series, authors

			const conn = await pool.getConnection();

			// category
			// const publisher_id = '0191896f-047a-7332-8f48-5ba16d59404f'; //body.publisher_id;
			// if (!publisher_id) {
			// 	throw new HTTPError(400, 'publisher');
			// }
			const publisher_stmt = `
			SELECT
				*
			FROM
			 	publishers
			WHERE
			 	id = ?`;
			const [publisher] = await conn.query<RowDataPacket[]>(publisher_stmt, [
				publisher_id,
			]);
			if (publisher_id && !publisher.length) {
				throw new HTTPError(404, 'publisher');
			}

			// category
			// const category_id = '02a06798-62e6-11ef-877e-0e4d59d62537'; //body.category_id;
			// if (!category_id) {
			// 	throw new HTTPError(400, 'category');
			// }
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
				throw new HTTPError(404, 'category');
			}

			// TODO: product_authors?

			const product_stmt = `
				INSERT INTO products (
					id,
					title,
					description,
					isbn,
					price,
					published_date,
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
					?
				);
			`;

			await conn.query<ResultSetHeader>(product_stmt, [
				uuidv7(),
				title,
				description,
				isbn,
				price,
				published_date,
				publisher_id,
				category_id,
			]);

			// TODO: refresh product and return product data
			set.status = 201;
			return { message: 'Product created successfully' };
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1, maxLength: 255 }),
				description: t.String({ minLength: 1, maxLength: 65535 }), // NOTE: mysql maximum length of TEXT is 65,535
				isbn: t.String({ minLength: 13, maxLength: 13 }), // TODO: isbn how many minl
				price: t.Number({ minimum: 0 }), // TODO: maximum ???
				published_date: t.Date({ format: 'date-time' }),
				publisher_id: t.Optional(t.String({ format: 'uuid' })),
				category_id: t.Optional(t.String({ format: 'uuid' })),
				// series_id: t.Optional(t.String()),
				// author_ids: t.Optional(t.Array(t.String())),
			}),
		},
	)
	.patch(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();
			const product_stmt = `
		SELECT
			*
		FROM
			products
		WHERE
			id = ?`;

			const [product] = await conn.query<RowDataPacket[]>(product_stmt, [id]);
			if (!product.length) {
				conn.release();
				throw new HTTPError(404, 'Product not found');
			}

			// TODO: update product

			conn.release();

			return { message: 'Product updated successfully' };
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
				description: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
				isbn: t.Optional(t.String({ minLength: 13, maxLength: 13 })),
				price: t.Optional(t.Number({ minimum: 0 })),
				published_date: t.Optional(t.Date({ format: 'date-time' })),
				publisher_id: t.Optional(t.String({ format: 'uuid' })),
				category_id: t.Optional(t.String({ format: 'uuid' })),
			}),
		},
	)
	.delete(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();
			const product_stmt = `
			SELECT
				*
			FROM
				products
			WHERE
				id = ?
			`;
			const [product] = await conn.query<RowDataPacket[]>(product_stmt, [id]);

			if (!product.length) {
				conn.release();
				throw new HTTPError(404, 'Product not found');
			}

			console.log(product);

			const delete_stmt = `
			DELETE
			FROM
				products
			WHERE
				id = ?`;
			const [deleted] = await conn.execute<ResultSetHeader>(delete_stmt, [id]);
			conn.release();

			if (!deleted) {
				throw new HTTPError(500, 'Product not deleted');
			}
			return {
				message: 'Product deleted successfully',
			};
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	);
