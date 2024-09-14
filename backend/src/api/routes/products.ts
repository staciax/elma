import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { type ProductRowPacketData, ProductsPublic } from '@/schemas/products';

import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

// TODO: check sql injection
// TODO: transaction for insert, update, delete
// TODO: remove duplicate code
// TODO: snake_case to camelCase (stmt)
// TODO: what t.Partial do?

export const router = new Elysia({
	prefix: '/products',
	tags: ['products'],
})
	// TODO: add role-based access control

	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();

			await conn.beginTransaction();

			// TODO: set isolation level

			const count_stmt = 'SELECT COUNT(*) AS count FROM products';
			const [count_results] = await conn.query<RowDataPacket[]>(count_stmt);
			if (!count_results.length) {
				throw new HTTPError(404, 'Product not found');
			}
			const count = count_results[0].count;

			const product_stmt = `
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
			GROUP BY products.id
			LIMIT ? OFFSET ?;
			`;
			const [results] = await conn.query<ProductRowPacketData[]>(product_stmt, [
				limit,
				offset,
			]);

			await conn.commit();
			conn.release();

			return {
				count: count,
				data: results,
			};
		},
		{
			query: t.Object({
				limit: t.Optional(t.Number({ minimum: 1, default: 100 })),
				offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
			}),
			response: {
				200: ProductsPublic,
			},
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			const conn = await pool.getConnection();
			const stmt = `
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
			WHERE products.id = ?;
			`;
			// TODO: join product_images

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
	.guard((app) =>
		app
			.use(superuser())
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
						is_active,
						publisher_id,
						category_id,
					},
				}) => {
					// TODO: make function for get publisher, category, series, authors
					// TODO: begin transaction
					const conn = await pool.getConnection();

					const publisher_stmt = `
					SELECT
						*
					FROM
						publishers
					WHERE
						id = ?`;
					const [publisher] = await conn.query<RowDataPacket[]>(
						publisher_stmt,
						[publisher_id],
					);
					if (publisher_id && !publisher.length) {
						throw new HTTPError(404, 'publisher');
					}

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
						is_active
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
						is_active,
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
						psysical_price: t.Optional(t.Number({ minimum: 0 })), // TODO: maximum ???
						published_date: t.Date({ format: 'date-time' }),
						is_active: t.Optional(t.Boolean({ default: true })),
						publisher_id: t.Optional(t.String({ format: 'uuid' })),
						category_id: t.Optional(t.String({ format: 'uuid' })),
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

					const [product] = await conn.query<RowDataPacket[]>(product_stmt, [
						id,
					]);
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
						psysical_price: t.Optional(t.Number({ minimum: 0 })),
						published_date: t.Optional(t.Date({ format: 'date-time' })),
						is_active: t.Optional(t.Boolean({ default: true })),
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
					const [product] = await conn.query<RowDataPacket[]>(product_stmt, [
						id,
					]);

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
					const [deleted] = await conn.execute<ResultSetHeader>(delete_stmt, [
						id,
					]);
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
			),
	);
