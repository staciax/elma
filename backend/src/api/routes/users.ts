import { pool } from '@/db';
import { getPasswordHash } from '@/security';
import { Elysia, t } from 'elysia';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v7 as uuidv7 } from 'uuid';

enum Role {
	SUPERUSER = 'SUPERUSER',
	ADMIN = 'ADMIN',
	MANAGER = 'MANAGER',
	EMPLOYEE = 'EMPLOYEE',
	CUSTOMER = 'CUSTOMER',
}

const session = new Elysia() //
	.derive({ as: 'scoped' }, async () => {
		const conn = await pool.getConnection();
		console.log('get conn');
		return { conn };
	});

// TODO: try catch every query // finally always release connection
// or release connection in onAfterHandle
// https://stackoverflow.com/a/57121491/19394867
// https://medium.com/@havus.it/understanding-connection-pooling-for-mysql-28be6c9e2dc0
// TODO: new password route
// TODO: me route with guard
// TODO: check conn not release
// TODO: use HTTPError instead of set.status

export const router = new Elysia({ prefix: '/users', tags: ['users'] })
	// .use(session)
	// .onAfterHandle(async ({ conn }) => {
	// 	conn.release();
	// 	// console.log(conn.test);
	// 	console.log('release conn');
	// })
	.get(
		'/',
		async ({ query: { limit, offset } }) => {
			const conn = await pool.getConnection();

			const stmt = `
		SELECT
			*
		FROM
			users
		LIMIT ?
		OFFSET ?;
		`;
			// TODO: join ?
			const [results] = await conn.query(stmt, [limit, offset]);
			conn.release();
			// conn.test = 'hi';
			return results;
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
		async ({ set, params: { id } }) => {
			const conn = await pool.getConnection();

			const stmt = `
			SELECT
				*
			FROM
				users
			WHERE id = ?;
			`;
			// TODO: join ?
			const [results] = await conn.query<RowDataPacket[]>(stmt, [id]);
			if (!results.length) {
				conn.release();
				set.status = 404;
				return { message: 'User not found' };
			}
			conn.release();
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
			body: { email, first_name, last_name, password, role, is_active },
		}) => {
			const conn = await pool.getConnection();
			const stmt = `
		INSERT INTO users
		(
			id,
			email,
			first_name,
			last_name,
			hashed_password,
			role,
			is_active
		)
		VALUES
		(
			?,
			?,
			?,
			?,
			?,
			?,
			?
		);
	`;
			const hashedPassword = await getPasswordHash(password);
			await conn.query<ResultSetHeader>(stmt, [
				uuidv7(),
				email,
				first_name,
				last_name,
				hashedPassword,
				role,
				is_active,
			]);

			const [userCreated] = await conn.query<RowDataPacket[]>(
				'SELECT * FROM users WHERE email = ?',
				[email],
			);
			// console.log(userCreated);
			if (!userCreated.length) {
				conn.release();
				return { message: 'Failed to create user' };
			}

			conn.release();

			set.status = 201;
			return userCreated;
		},
		{
			body: t.Object({
				email: t.String({ format: 'email', error: 'Invalid email' }),
				first_name: t.String({ maxLength: 128 }),
				last_name: t.String({ maxLength: 128 }),
				password: t.String({ minLength: 8 }),
				role: t.Enum(Role),
				is_active: t.Boolean({ default: true }),
			}),
		},
	)
	.patch(
		'/:id',
		async ({
			set,
			params: { id },
			body: { email, first_name, last_name, role, is_active },
		}) => {
			console.log(email, first_name, last_name, role, is_active);

			const conn = await pool.getConnection();

			// TODO: check email if exists

			const stmt = 'SELECT * FROM users WHERE id = ?';
			const [updateUser] = await conn.query<RowDataPacket[]>(stmt, [id]);
			// console.log(updateUser);
			if (!updateUser.length) {
				conn.release();
				set.status = 404;
				return { message: 'User not found' };
			}
			conn.release();
			// TODO: do update with transaction

			return { message: 'User updated successfully' };
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
			body: t.Object({
				email: t.Optional(t.String({ format: 'email' })),
				first_name: t.Optional(t.String()),
				last_name: t.Optional(t.String()),
				// password: t.String(),
				role: t.Optional(t.Enum(Role)),
				is_active: t.Optional(t.Boolean()),
			}),
		},
	)
	.delete(
		'/:id',
		async ({ set, params: { id } }) => {
			const conn = await pool.getConnection();

			const stmt = 'SELECT * FROM users WHERE id = ?';
			const [deleteUser] = await conn.query<RowDataPacket[]>(stmt, [id]);

			// console.log(deleteUser);
			if (!deleteUser.length) {
				conn.release();
				set.status = 404;
				return { message: 'User not found' };
			}

			// delete user
			const deleteUserStmt = 'DELETE FROM users WHERE id = ?';
			await conn.execute<ResultSetHeader>(deleteUserStmt, [id]);

			conn.release();
			return { message: 'User deleted successfully' };
		},
		{
			params: t.Object({
				id: t.String({ format: 'uuid' }),
			}),
		},
	);
