import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { Login } from '@/schemas/auth';
import { Token } from '@/schemas/token';
import { security } from '@/security';
import { verifyPassword } from '@/security';
import { Elysia } from 'elysia';
import type { RowDataPacket } from 'mysql2/promise';

// TODO: reimplement cookie set on backend?
// what about httpOnly?, secure?, sameSite?, expires?, etc.
// TODO: read about OAuth2.0 https://datatracker.ietf.org/doc/html/rfc6750

export const router = new Elysia({ prefix: '/auth', tags: ['auth'] })
	.use(security)
	.post(
		'/sign',
		async ({ jwt, body: { username, password } }) => {
			const conn = await pool.getConnection();

			// console.log('email', email);
			const user_stmt = 'SELECT * FROM users WHERE email=?';
			const [user_results] = await conn.query<RowDataPacket[]>(user_stmt, [
				username,
			]);
			conn.release();
			if (!user_results.length) {
				throw new HTTPError(404, 'User not found');
			}
			const user = user_results[0];

			const isMatch = await verifyPassword(password, user?.hashed_password);

			if (!isMatch) {
				throw new HTTPError(400, 'Invalid password');
			}

			const access_token = await jwt.sign({ sub: user.id });

			// try {
			// 	const [results] = await conn.query(stmt, [email, password]);
			// 	console.log(results);
			// 	await conn.commit();
			// } catch {
			// 	conn.rollback();
			// } finally {
			// 	conn.release();
			// }

			return { access_token };
		},
		{
			body: Login,
			response: { 200: Token },
		},
	);
