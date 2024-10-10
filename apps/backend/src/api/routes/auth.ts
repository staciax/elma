import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { Login } from '@/schemas/auth';
import { Token } from '@/schemas/token';
import { security } from '@/security';
import { verifyPassword } from '@/security';
import type { UserRow } from '@/types/users';

import { Elysia } from 'elysia';

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
			// TODO: should begin transaction here right?

			const stmt = 'SELECT * FROM users WHERE email=?';
			const [results] = await conn.execute<UserRow[]>(stmt, [username]);
			conn.release();

			if (!results.length) {
				throw new HTTPError(404, 'User not found');
			}
			const user = results[0];

			// TODO: user?.hashed_password or user.hashed_password
			const isMatch = await verifyPassword(password, user?.hashed_password);

			if (!isMatch) {
				throw new HTTPError(400, 'Invalid password');
			}

			const access_token = await jwt.sign({ sub: user.id });

			// try {
			// 	await conn.beginTransaction();
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
