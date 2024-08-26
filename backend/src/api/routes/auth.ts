import { pool } from '@/db';
import { security } from '@/security';
import { Elysia, t } from 'elysia';

import { HTTPError } from '@/errors';
import { Message } from '@/schemas/message';
import { SignInDTO } from '@/schemas/users';
import { verifyPassword } from '@/security';
import type { RowDataPacket } from 'mysql2/promise';

// TODO: reimplement cookie set on backend?
// what about httpOnly?, secure?, sameSite?, expires?, etc.

const Token = t.Object({
	accessToken: t.String(),
});

export const router = new Elysia({ prefix: '/auth', tags: ['auth'] })
	.use(security)
	.model({
		'user.sign-in': SignInDTO,
		token: Token,
		message: Message,
	})
	.post(
		'/sign',
		async ({ jwt, body: { email, password } }) => {
			const conn = await pool.getConnection();

			// console.log('email', email);
			const user_stmt = 'SELECT * FROM users WHERE email=?';
			const [user_results] = await conn.query<RowDataPacket[]>(user_stmt, [
				email,
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

			const accessToken = await jwt.sign({ sub: user.id });

			// try {
			// 	const [results] = await conn.query(stmt, [email, password]);
			// 	console.log(results);
			// 	await conn.commit();
			// } catch {
			// 	conn.rollback();
			// } finally {
			// 	conn.release();
			// }

			return { accessToken };
		},
		{
			body: 'user.sign-in',
			response: { 200: 'token' },
		},
	);
