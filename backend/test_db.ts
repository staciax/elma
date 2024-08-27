import { env } from '@/config';
import mysql, { type RowDataPacket } from 'mysql2/promise';

export const pool = mysql.createPool({
	uri: env.DATABASE_URI,
	connectionLimit: 10,
});

const conn = await pool.getConnection();

try {
	await conn.beginTransaction();
	const stmt = `
	`;
	const [rows, fields] = await conn.query<RowDataPacket[]>(stmt);
	console.log(rows);
	console.log(fields);
	conn.commit();
} catch (err) {
	console.log(err);
	conn.rollback();
} finally {
	conn.release();
}

await pool.end();
