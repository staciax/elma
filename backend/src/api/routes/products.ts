import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { superuser } from '@/plugins/auth';
import { Elysia, t } from 'elysia';
import type { RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

// TODO: check sql injection
// TODO: transaction for insert, update, delete
// TODO: remove duplicate code

export const router = new Elysia({
	prefix: '/products',
	tags: ['products'],
})
	// .use(superuser())
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const count_stmt = 'SELECT COUNT(*) AS count FROM products';
			const conn = await pool.getConnection();

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
					product.published_date AS product_published_date
				FROM
					products AS product
				LEFT JOIN
			 		publishers AS publisher ON product.publisher_id = publisher.id
				LEFT JOIN
					categories AS category ON product.category_id = category.id
			`;
			const [product_results] = await conn.query<RowDataPacket[]>(product_stmt);
			return {
				count: count,
				data: product_results,
			};

			// const product_stmt = `
			// 	SELECT
			// 		p.id AS product_id,
			// 		p.title AS product_title,
			// 		p.description AS product_description,
			// 		p.isbn AS product_isbn,
			// 		p.price AS product_price,
			// 		p.published_date AS product_published_date,
			// 		pub.publisher_id AS publisher_id,
			// 		pub.name AS publisher_name,
			// 		cat.category_id AS category_id,
			// 		cat.name AS category_name,
			// 		a.author_id AS author_id,
			// 		a.first_name AS author_first_name,
			// 		a.last_name AS author_last_name,
			// 		pi.id AS product_image_id,
			// 		pi.url AS product_image_url
			// 	FROM
			// 		products AS p
			// 	LEFT JOIN
			// 		publishers AS pub ON p.id = pub.publisher_id
			// 	LEFT JOIN
			// 		categories AS cat ON p.id = cat.category_id
			// 	LEFT JOIN
			// 		product_authors AS pa ON p.product_id = pa.product_id
			// 	LEFT JOIN
			// 		authors AS a ON pa.author_id = a.author_id
			// 	LEFT JOIN
			// 		product_images AS pi ON p.product_id = pi.product_id
			// 	LIMIT ${limit} OFFSET ${offset}
			// `;
			// 		// GROUP BY
			// 		//	p.product_id, pub.publisher_id, cat.category_id, ser.series_id, a.author_id, pi.id
			// 		const products = await prisma.$queryRaw(product_stmt);
			// 		const result = [
			// 			{
			// 				count: count[0].count,
			// 				data: products,
			// 			},
			// 		];
			// 		return result;
		},
		{
			query: t.Object({
				limit: t.Optional(t.Number({ default: 100 })),
				offset: t.Optional(t.Number({ default: 0 })),
			}),
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			// 	const stmt = Prisma.raw(`
			// 	SELECT
			// 		p.product_id AS product_id,
			// 		p.title AS product_title,
			// 		p.description AS product_description,
			// 		p.isbn AS product_isbn,
			// 		p.price AS product_price,
			// 		p.published_date AS product_published_date,
			// 		pub.publisher_id AS publisher_id,
			// 		pub.name AS publisher_name,
			// 		cat.category_id AS category_id,
			// 		cat.name AS category_name,
			// 		ser.series_id AS series_id,
			// 		ser.name AS series_name,
			// 		a.author_id AS author_id,
			// 		a.first_name AS author_first_name,
			// 		a.last_name AS author_last_name,
			// 		pi.id AS product_image_id,
			// 		pi.url AS product_image_url
			// 	FROM
			// 		products AS p
			// 	LEFT JOIN
			// 		publishers AS pub ON p.publisher_id = pub.publisher_id
			// 	LEFT JOIN
			// 		categories AS cat ON p.category_id = cat.category_id
			// 	LEFT JOIN
			// 		series AS ser ON p.series_id = ser.series_id
			// 	LEFT JOIN
			// 		product_authors AS pa ON p.product_id = pa.product_id
			// 	LEFT JOIN
			// 		authors AS a ON pa.author_id = a.author_id
			// 	LEFT JOIN
			// 		product_images AS pi ON p.product_id = pi.product_id
			// 	WHERE p.product_id = '${id}'
			// `);
			// 	// TODO: remove duplicate code
			// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			// 	const result = await prisma.$queryRaw<any[]>(stmt);
			// 	if (!result.length) {
			// 		throw new HTTPError(404, 'Product not found');
			// 	}
			// 	return result;
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.post(
		'/',
		async ({ body: { title, description, isbn, price, published_date } }) => {
			// 	// TODO: remove hard-coded values
			// 	// TODO: make function for get publisher, category, series, authors
			// 	// publisher
			// 	const publisher_id = '019141d2-e151-7033-ac9e-dfb4e8975224'; //body.publisher_id;
			// 	if (!publisher_id) {
			// 		throw new HTTPError(400, 'publisher');
			// 	}
			// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			// 	const publisher = await prisma.$queryRaw<any[]>`
			// SELECT
			// 	*
			// FROM
			// 	publishers as pub
			// WHERE
			// 	pub.publisher_id = ${publisher_id}`;
			// 	if (publisher_id && !publisher.length) {
			// 		throw new HTTPError(404, 'publisher');
			// 	}
			// 	// category
			// 	const category_id = '019141d2-e153-7a13-9ce5-50aead8148f4'; //body.category_id;
			// 	if (!category_id) {
			// 		throw new HTTPError(400, 'category');
			// 	}
			// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			// 	const category = await prisma.$queryRaw<any[]>`
			// SELECT
			// 	*
			// FROM
			// 	categories as cat
			// WHERE
			// 	cat.category_id = ${category_id}`;
			// 	if (category_id && !category.length) {
			// 		throw new HTTPError(404, 'category');
			// 	}
			// 	// series
			// 	const series_id = '019141d8-29a4-70d2-b845-2b26ef3a0f5c'; //body.series_id;
			// 	if (!series_id) {
			// 		throw new HTTPError(400, 'series');
			// 	}
			// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			// 	const series = await prisma.$queryRaw<any[]>`
			// SELECT
			// 	*
			// FROM
			// 	series as ser
			// WHERE
			// 	ser.series_id = ${series_id}`;
			// 	if (series_id && !series.length) {
			// 		throw new HTTPError(404, 'category');
			// 	}
			// 	// TODO: remove author add and make route for add author
			// 	// authors
			// 	const author_ids = [
			// 		'019141d8-29a4-70d2-b845-2b3edf7c59b3',
			// 		'019141d8-29a5-78c1-a602-3f4535f973b2',
			// 		'019141d8-3af7-78f0-ba8b-a610a7bd2a3c',
			// 	];
			// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			// 	const authors = await prisma.$queryRaw<any[]>`
			// SELECT
			// 	*
			// FROM
			// 	authors AS a
			// WHERE
			// 	a.author_id IN (${Prisma.join(author_ids)})`;
			// 	if (author_ids.length !== authors.length) {
			// 		const missing_authors = author_ids.filter(
			// 			(id) => !authors.find((a) => a.author_id === id),
			// 		);
			// 		throw new HTTPError(404, `Author(s) not found: ${missing_authors}`);
			// 	}
			// 	// TODO: subquery insert product, insert product_authors?
			// 	// https://stackoverflow.com/questions/56870713/returning-in-insert-into-statement-with-a-select-statement
			// 	const product_stmt = Prisma.raw(`
			// 	INSERT INTO products as p (
			// 		product_id,
			// 		title,
			// 		description,
			// 		isbn,
			// 		price,
			// 		published_date,
			// 		publisher_id,
			// 		category_id,
			// 		series_id
			// 	)
			// 	VALUES (
			// 	 	'${uuidv7()}',
			// 		'${title}',
			// 		'${description}',
			// 		'${isbn}',
			// 		${new Prisma.Decimal(price)},
			// 		'${new Date(published_date).toISOString()}',
			// 		'${publisher_id}',
			// 		'${category_id}',
			// 		'${series_id}'
			// 	)
			// 	RETURNING
			// 		p.product_id AS product_id,
			// 		p.title AS product_title,
			// 		p.description AS product_description,
			// 		p.isbn AS product_isbn,
			// 		p.price AS product_price,
			// 		p.published_date AS product_published_date,
			// 		p.publisher_id AS publisher_id,
			// 		p.category_id AS category_id,
			// 		p.series_id AS series_id
			// `);
			// 	const result = await prisma.$queryRaw(product_stmt);
			// 	return result;
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1, maxLength: 255 }),
				description: t.String({ minLength: 1 }),
				isbn: t.String({ maxLength: 13 }),
				price: t.Number({ minimum: 0 }), // TODO: maximum ???
				published_date: t.Date(),
				publisher_id: t.Optional(t.String()),
				category_id: t.Optional(t.String()),
				series_id: t.Optional(t.String()),
				author_ids: t.Optional(t.Array(t.String())),
			}),
		},
	)
	.patch('/:id', async ({ params: { id } }) => {
		// 	const product_stmt = Prisma.raw(`
		// SELECT
		// 	p.product_id AS product_id
		// FROM
		// 	products AS p
		// WHERE
		// 	p.product_id = '${id}'`);
		// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		// 	const product = await prisma.$queryRaw<any[]>(product_stmt);
		// 	if (!product.length) {
		// 		throw new HTTPError(404, 'Product not found');
		// 	}
	})
	.delete(
		'/:id',
		async ({ params: { id } }) => {
			// 	const product_stmt = Prisma.raw(`
			// SELECT
			// 	p.product_id AS product_id
			// FROM
			// 	products AS p
			// WHERE
			// 	p.product_id = '${id}'`);
			// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			// 	const product = await prisma.$queryRaw<any[]>(product_stmt);
			// 	if (!product.length) {
			// 		throw new HTTPError(404, 'Product not found');
			// 	}
			// 	const delete_stmt = Prisma.raw(`
			// DELETE
			// FROM
			// 	products AS p
			// WHERE
			// 	p.product_id = '${id}'`);
			// 	const deleted = await prisma.$executeRaw(delete_stmt);
			// 	if (!deleted) {
			// 		throw new HTTPError(500, 'Product not deleted');
			// 	}
			// 	return {
			// 		message: 'Product deleted successfully',
			// 	};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	);
