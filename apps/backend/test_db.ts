import { env } from '@/config';
import mysql, { type RowDataPacket } from 'mysql2/promise';

export const pool = mysql.createPool({
	uri: env.DATABASE_URI,
	connectionLimit: 10,
	multipleStatements: true,
});

const conn = await pool.getConnection();

// try {
// 	await conn.beginTransaction();
// 	const stmt = `
// 	`;
// 	const [rows, fields] = await conn.query<RowDataPacket[]>(stmt);
// 	console.log(rows);
// 	console.log(fields);
// 	conn.commit();
// } catch (err) {
// 	console.log(err);
// 	conn.rollback();
// } finally {
// 	conn.release();
// }

async function getUsers() {
	const stmt = `SELECT * FROM users LIMIT 1
`;

	const [results] = await conn.query(stmt);
	console.log(results);

	// console.log(fields);
}

async function getProducts() {
	// 	const stmt = `
	// 	SELECT
	// 		product.id AS id,
	// 		product.title AS title,
	// 		product.price AS price,
	// 		GROUP_CONCAT(
	// 			DISTINCT CONCAT(author.id, ';', author.first_name, ';' ,author.last_name)
	// 			-- ORDER BY author.id
	// 			-- SEPARATOR ','
	// 		) AS authors
	// 	FROM
	// 		products AS product
	// 	LEFT JOIN
	// 		product_authors AS product_author ON product.id = product_author.product_id
	// 	LEFT JOIN
	// 		authors AS author ON product_author.author_id = author.id
	// 	GROUP BY product.id;
	// `;
	const stmt = `
	SELECT
		products.id AS id,
		products.title AS title,
		products.description AS description,
		products.isbn AS isbn,
		products.price AS ebook_price,
		products.price AS paper_price,
		products.published_date AS published_date,

		publisher.id AS publisher_id,
		publisher.name AS publisher_name,

		category.id AS category_id,
		category.name AS category_name,

		-- CONCAT(publisher.id, ';', publisher.name) AS publisher,
		-- CONCAT(category.id, ';', category.name) AS category,

		GROUP_CONCAT(CONCAT(author.id, ';', author.first_name, ';' ,author.last_name)) AS authors
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
	const [rows] = await conn.query<RowDataPacket[]>(stmt, [100, 0]);

	const results = rows.map((row) => {
		// publisher
		// const publisher = {
		// 	id: row.publisher_id,
		// 	name: row.publisher_name,
		// };
		// row.publisher_id = row.publisher_name = undefined;

		// // category
		// const category = {
		// 	id: row.category_id,
		// 	name: row.category_name,
		// };
		// row.category_id = row.category_name = undefined;

		// const [publisher_id, publisher_name] = row.publisher.split(';');
		// const publisher = { id: publisher_id, name: publisher_name };

		// const [publisher_id, publisher_name] = row.publisher.split(';');

		// const [category_id, category_name] = row.category.split(';');
		// const category = { id: category_id, name: category_name };

		// let publisher = null;
		// if (row.publisher) {
		// 	const [id, name] = row.publisher.split(';');
		// 	publisher = { id, name };
		// }

		// let category = null;
		// if (row.category) {
		// 	const [id, name] = row.category.split(';');
		// 	category = { id, name };
		// }

		// publisher
		const publisher =
			row.publisher_id && row.publisher_name
				? {
						id: row.publisher_id,
						name: row.publisher_name,
					}
				: null;
		row.publisher_id = row.publisher_name = undefined;

		// category
		const category =
			row.category_id && row.category_name
				? {
						id: row.category_id,
						name: row.category_name,
					}
				: null;
		row.category_id = row.category_name = undefined;

		const authors = row.authors
			? row.authors.split(',').map((author: RowDataPacket) => {
					const [id, first_name, last_name] = author.split(';');
					return { id: id, first_name, last_name };
				})
			: [];

		return {
			...row,
			publisher,
			category,
			authors,
		};
	});

	console.log(results);
}

async function getProductsJson() {
	// -- JSON_OBJECT(
	// 	--	'id', publisher.id,
	// 	--	'name', publisher.name
	// 	-- ) AS publisher,

	// 	-- JSON_OBJECT(
	// 	-- 	'id', category.id,
	// 	--	'name', category.name
	// 	-- ) AS category,

	// JSON_ARRAYAGG(
	// 	JSON_OBJECT(
	// 		'id', author.id,
	// 		'first_name', author.first_name,
	// 		'last_name', author.last_name
	// 	)
	// ) AS authors

	// https://www.w3resource.com/mysql/control-flow-functions/if-function.php
	// https://stackoverflow.com/questions/77281450/mysql-select-into-json-arrayagg

	const stmt = `
	SELECT
		products.id AS id,
		products.title AS title,
		products.description AS description,
		products.isbn AS isbn,
		products.price AS ebook_price,
		products.price AS paper_price,
		products.published_date AS published_date,

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
					'first_name', author.first_name,
					'last_name', author.last_name
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
	const [rows] = await conn.query<RowDataPacket[]>(stmt, [100, 0]);
	console.log(rows);
}

// await getProducts();
await getProductsJson();

await pool.end();
