import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { currentUser, superuser } from '@/plugins/auth';
import { Message } from '@/schemas/message';
import { UserRegiser, type UserRowPacketData } from '@/schemas/users';
import {
	UpdatePassword,
	UserCreate,
	UserMePublic,
	UserMeUpdate,
	UserPublic,
	UserUpdate,
	UsersPublic,
} from '@/schemas/users';
import { getPasswordHash, verifyPassword } from '@/security';

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

const _session = new Elysia() //
	.derive({ as: 'scoped' }, async () => {
		const conn = await pool.getConnection();
		console.log('get conn');
		return { conn };
	});

// TODO: try catch every query // finally always release connection
// or release connection in onAfterHandle
// https://stackoverflow.com/a/57121491/19394867
// https://medium.com/@havus.it/understanding-connection-pooling-for-mysql-28be6c9e2dc0
// TODO: check conn not release
// TODO: response schema
// TODO: signup/register schema

export const router = new Elysia({ prefix: '/users', tags: ['users'] })
	// .use(session)
	// .onAfterHandle(async ({ conn }) => {
	// 	conn.release();
	// 	console.log('release conn');
	// })
	.guard((app) =>
		app
			.use(superuser())
			.get(
				'/',
				async ({ query: { limit, offset } }) => {
					const conn = await pool.getConnection();

					const countStmt = 'SELECT COUNT(*) as count FROM users;';
					const [count] = await conn.query<RowDataPacket[]>(countStmt);

					const stmt = `
					SELECT
						users.id as id,
						users.email as email,
						users.first_name as first_name,
						users.last_name as last_name,
						users.phone_number as phone_number,
						-- users.hashed_password as hashed_password,
						users.role as role,
						users.is_active as is_active,
						users.created_at as created_at,
						users.updated_at as updated_at
					FROM
						users
					LIMIT ?
					OFFSET ?;
					`;
					// TODO: join ?
					const [results] = await conn.query<UserRowPacketData[]>(stmt, [
						limit,
						offset,
					]);
					conn.release();

					return {
						count: count[0].count,
						data: results,
					};
				},
				{
					query: t.Object({
						limit: t.Number({ minimum: 1, default: 100 }),
						offset: t.Number({ minimum: 0, default: 0 }),
					}),
					response: {
						200: UsersPublic,
					},
				},
			)
			.get(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					const stmt = `
					SELECT
						users.id as id,
						users.email as email,
						users.first_name as first_name,
						users.last_name as last_name,
						users.phone_number as phone_number,
						-- users.hashed_password as hashed_password,
						users.role as role,
						users.is_active as is_active,
						users.created_at as created_at,
						users.updated_at as updated_at
					FROM
						users
					WHERE id = ?;
					`;
					// TODO: join ?
					const [results] = await conn.query<UserRowPacketData[]>(stmt, [id]);
					if (!results.length) {
						conn.release();
						throw new HTTPError(404, 'User not found');
					}
					conn.release();
					return results[0];
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					response: {
						200: UserPublic,
					},
				},
			)
			.post(
				'/',
				async ({
					set,
					body: {
						email,
						first_name,
						last_name,
						phone_number,
						password,
						role,
						is_active,
					},
				}) => {
					const conn = await pool.getConnection();

					// check email if exists
					const checkStmt = 'SELECT * FROM users WHERE email = ?';
					const [checkUser] = await conn.query<RowDataPacket[]>(checkStmt, [
						email.toLowerCase(),
					]);

					if (checkUser.length) {
						conn.release();
						throw new HTTPError(400, 'Email already exists');
					}

					const hashedPassword = await getPasswordHash(password);

					try {
						await conn.beginTransaction();
						const stmt = `
						INSERT INTO users
						(
							id,
							email,
							first_name,
							last_name,
							phone_number,
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
							?,
							?
						);
				`;
						await conn.query<ResultSetHeader>(stmt, [
							uuidv7(),
							email.toLowerCase(),
							first_name,
							last_name,
							phone_number,
							hashedPassword,
							role,
							is_active,
						]);
						await conn.commit();
					} catch (error) {
						await conn.rollback();
						// TODO: error handling
						throw error;
					}

					// TODO: refresh user created

					const [userCreated] = await conn.query<RowDataPacket[]>(
						'SELECT * FROM users WHERE email = ?',
						[email],
					);
					conn.release();

					// console.log(userCreated);
					if (!userCreated.length) {
						return { message: 'Failed to create user' };
					}

					set.status = 201;
					return userCreated[0];
				},
				{
					body: UserCreate,
					response: {
						201: UserPublic,
					},
				},
			)
			.patch(
				'/:id',
				async ({ params: { id }, body }) => {
					if (!Object.keys(body).length) {
						throw new HTTPError(400, 'No data to update');
					}

					const conn = await pool.getConnection();

					const stmt = 'SELECT * FROM users WHERE id = ?';
					const [updateUser] = await conn.query<RowDataPacket[]>(stmt, [id]);
					if (!updateUser.length) {
						conn.release();
						throw new HTTPError(404, 'User not found');
					}

					const {
						email,
						password,
						first_name,
						last_name,
						phone_number,
						role,
						is_active,
					} = body;

					const columns = [];
					const values = [];

					if (email) {
						columns.push('email = ?');
						values.push(email.toLowerCase());
					}

					if (password) {
						const hashedPassword = await getPasswordHash(password);
						columns.push('hashed_password = ?');
						values.push(hashedPassword);
					}

					if (first_name) {
						columns.push('first_name = ?');
						values.push(first_name);
					}

					if (last_name) {
						columns.push('last_name = ?');
						values.push(last_name);
					}

					if (phone_number) {
						columns.push('phone_number = ?');
						values.push(phone_number);
					}

					if (role) {
						columns.push('role = ?');
						values.push(role);
					}

					if (is_active !== undefined) {
						columns.push('is_active = ?');
						values.push(is_active);
					}

					if (!columns.length || !values.length) {
						conn.release();
						throw new HTTPError(400, 'No data to update');
					}

					try {
						await conn.beginTransaction();

						const updateStmt = `
						UPDATE
							users
						SET
							${columns.join(', ')}
						WHERE
							id = ?;
						`;

						await conn.execute<ResultSetHeader>(updateStmt, [...values, id]);
						await conn.commit();
					} catch (error) {
						// TODO: error handling
						await conn.rollback();
						throw error;
					} finally {
						conn.release();
					}

					return { message: 'User updated successfully' };
				},
				{
					params: t.Object({
						id: t.String({ format: 'uuid' }),
					}),
					body: UserUpdate,
					response: {
						200: Message,
					},
				},
			)
			.delete(
				'/:id',
				async ({ params: { id } }) => {
					const conn = await pool.getConnection();

					const userStmt = 'SELECT * FROM users WHERE id = ?';
					const [deleteUser] = await conn.query<RowDataPacket[]>(userStmt, [
						id,
					]);

					// console.log(deleteUser);
					if (!deleteUser.length) {
						conn.release();
						throw new HTTPError(404, 'User not found');
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
					response: {
						200: Message,
					},
				},
			),
	)
	.guard(
		(app) =>
			app
				.use(currentUser())
				.get('/me', async ({ user }) => user, {
					response: {
						200: UserMePublic,
					},
				})
				.patch(
					'/me',
					async ({ user, body }) => {
						if (!Object.keys(body).length) {
							throw new HTTPError(400, 'No data to update');
						}

						const { email, first_name, last_name, phone_number } = body;

						const columns = [];
						const values = [];

						// for (const [key, value] of Object.entries(body)) {
						// 	columns.push(`${key} = ?`);
						// 	values.push(value);
						// }

						if (email) {
							columns.push('email = ?');
							values.push(email.toLowerCase());
						}

						if (first_name) {
							columns.push('first_name = ?');
							values.push(first_name);
						}

						if (last_name) {
							columns.push('last_name = ?');
							values.push(last_name);
						}

						if (phone_number) {
							columns.push('phone_number = ?');
							values.push(phone_number);
						}

						if (!columns.length || !values.length) {
							throw new HTTPError(400, 'No data to update');
						}

						const conn = await pool.getConnection();

						try {
							await conn.beginTransaction();

							const stmt = `
							UPDATE
								users
							SET
								${columns.join(', ')}
							WHERE
								id = ?;
							`;

							await conn.execute<ResultSetHeader>(stmt, [...values, user.id]);
							await conn.commit();
						} catch (error) {
							// TODO: error handling
							await conn.rollback();
							throw error;
						} finally {
							conn.release();
						}

						return { message: 'User updated successfully' };
					},
					{
						body: UserMeUpdate,
						response: { 200: Message },
					},
				)
				.patch(
					'/me/password',
					async ({ user, body: { current_password, new_password } }) => {
						// TODO: check password is same as current password?
						const passwordIsValid = await verifyPassword(
							current_password,
							user.hashed_password,
						);

						if (!passwordIsValid) {
							throw new HTTPError(400, 'Invalid password');
						}

						if (current_password === new_password) {
							throw new HTTPError(400, 'New password must be different');
						}

						const conn = await pool.getConnection();

						const hashedPassword = await getPasswordHash(new_password);

						try {
							await conn.beginTransaction();
							const stmt = `
							UPDATE
								users
							SET
								hashed_password = ?
							WHERE
								id = ?;
							`;
							await conn.execute<ResultSetHeader>(stmt, [
								hashedPassword,
								user.id,
							]);
							await conn.commit();
						} catch (error) {
							// TODO: error handling
							await conn.rollback();
							throw error;
						} finally {
							conn.release();
						}

						return { message: 'User updated successfully' };
					},
					{
						body: UpdatePassword,
						response: {
							200: Message,
						},
					},
				)
				.delete(
					'/me',
					async ({ user }) => {
						if (user.role === Role.SUPERUSER) {
							throw new HTTPError(
								403,
								'Super user are not allowed to delete themselves',
							);
						}

						const conn = await pool.getConnection();

						try {
							await conn.beginTransaction();
							const stml = 'DELETE FROM users WHERE id = ?';
							await conn.execute<ResultSetHeader>(stml, [user.id]);
							await conn.commit();
						} catch (error) {
							// TODO: error handling
							await conn.rollback();
							throw error;
						} finally {
							conn.release();
						}

						return { message: 'User deleted successfully' };
					},
					{
						response: {
							200: Message,
						},
					},
				),
		// TODO: me update password
	)
	.post(
		'/signup',
		async ({ set, body }) => {
			const conn = await pool.getConnection();

			const { email, password, first_name, last_name } = body;

			const stmt = 'SELECT * FROM users WHERE email = ?';
			const [user] = await conn.query<RowDataPacket[]>(stmt, [email]);
			if (user.length) {
				conn.release();
				throw new HTTPError(400, 'Email already exists');
			}
			// TODO: หรือ insert ไปเลย แล้้วค่อย check ว่า insert ได้ไหม แบบ catch error ว่า email ซ้ำไหม

			try {
				await conn.beginTransaction();
				const insertStmt = `
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
				await conn.query<ResultSetHeader>(insertStmt, [
					uuidv7(),
					email,
					first_name,
					last_name,
					hashedPassword,
					Role.CUSTOMER,
					true, // TODO: to false wehn email verification is implemented
				]);
				await conn.commit();
			} catch (error) {
				await conn.rollback();
				// TODO: error handling
				throw error;
			} finally {
				conn.release();
			}

			set.status = 201;
			return { message: 'User created successfully' };
		},
		{
			body: UserRegiser,
			response: {
				201: Message,
			},
		},
	);
