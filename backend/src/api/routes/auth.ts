import { pool } from "@/db";
import { HTTPError } from "@/errors";
import { Login } from "@/schemas/auth";
import { Token } from "@/schemas/token";
import { security } from "@/security";
import { verifyPassword } from "@/security";
import type { UserRow } from "@/types/users";

import { Elysia } from "elysia";
// import type { PoolConnection } from 'mysql2/promise';

// TODO: reimplement cookie set on backend?
// what about httpOnly?, secure?, sameSite?, expires?, etc.
// TODO: read about OAuth2.0 https://datatracker.ietf.org/doc/html/rfc6750

// const authenticate = async (
// 	conn: PoolConnection,
// 	email: string,
// 	password: string,
// ): Promise<UserRow | null> => {
// 	const stmt = 'SELECT * FROM users WHERE email = ?';
// 	const [results] = await conn.execute<UserRow[]>(stmt, [email]);
// 	if (!results.length) {
// 		return null;
// 	}
// 	const user = results[0];

// 	if (!(await verifyPassword(password, user?.hashed_password))) {
// 		return null;
// 	}

// 	return user;
// };

export const router = new Elysia({ prefix: "/auth", tags: ["auth"] })
	.use(security)
	.post(
		"/sign",
		async ({ jwt, body: { username, password } }) => {
			const conn = await pool.getConnection();

			// console.log('email', email);
			// TODO: should begin transaction here right?

			const stmt = "SELECT * FROM users WHERE email = ?";
			const [results] = await conn.execute<UserRow[]>(stmt, [username]);
			conn.release();

			if (!results.length) {
				throw new HTTPError(400, "Invalid credentials");
			}
			const user = results[0];

			const isMatch = await verifyPassword(password, user.hashed_password);

			if (!isMatch) {
				throw new HTTPError(400, "Invalid credentials");
			}

			if (!user.is_active) {
				throw new HTTPError(400, "User is not active");
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
			response: { 200: Token }
		}
	);
