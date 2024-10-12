import { pool } from '@/db';
import { UserRoles } from '@/enums';
import { HTTPError } from '@/errors';
import { security } from '@/security';
import type { UserRow } from '@/types/users';

import { bearer } from '@elysiajs/bearer';
import { type Context, Elysia } from 'elysia';

// async function _findUserById(_userId: string) {
// 	// return prisma.user.findUnique({
// 	// 	where: {
// 	// 		id: userId,
// 	// 	},
// 	// });
// 	return {};
// }

// TODO: role-based access control
// type UserRole = {
// 	role?: 'user' | 'admin';
// 	isSuperuser?: boolean;
// };

// TODO: remove duplicate code

export const currentUser = new Elysia({ name: 'current-user' })
	.use(bearer())
	.use(security)
	.derive({ as: 'scoped' }, async ({ set, jwt, bearer }) => {
		// validate token
		if (!bearer) {
			set.headers['WWW-Authenticate'] = 'Bearer';
			throw new HTTPError(401, 'Not authenticated');
		}

		const jwtPayload = await jwt.verify(bearer);
		if (!jwtPayload) {
			throw new HTTPError(401, 'Not authenticated');
		}

		// get user
		const conn = await pool.getConnection();

		const stmt = 'SELECT * FROM users WHERE id = ?';
		const [results] = await conn.execute<UserRow[]>(stmt, [jwtPayload.sub]);
		conn.release();

		if (!results.length) {
			throw new HTTPError(404, 'User not found');
		}
		const user = results[0];

		if (!user.is_active) {
			throw new HTTPError(400, 'Inactive user');
		}

		return { user };
	});

export const superuser = () =>
	new Elysia({ name: 'superuser' })
		.use(bearer())
		.use(security)
		.derive({ as: 'scoped' }, async ({ jwt, bearer }) => {
			// validate token
			if (!bearer) {
				throw new HTTPError(401, 'Not authenticated', {
					'WWW-Authenticate': 'Bearer',
				});
			}
			const jwtPayload = await jwt.verify(bearer);
			if (!jwtPayload) {
				throw new HTTPError(401, 'Not authenticated');
			}
			const conn = await pool.getConnection();

			const stmt = 'SELECT * FROM users WHERE id = ?';
			const [results] = await conn.execute<UserRow[]>(stmt, [jwtPayload.sub]);
			conn.release();

			if (!results.length) {
				throw new HTTPError(404, 'User not found');
			}
			const user = results[0];

			if (!user.is_active) {
				throw new HTTPError(400, 'Inactive user');
			}

			// TODO: user?.role or user.role
			if (user?.role !== UserRoles.SUPERUSER) {
				throw new HTTPError(403, 'Forbidden');
			}

			return { user };
		});

// export const hasPermission = (
// 	userRoles: Role | Role[],
// 	requiredRoles: Role | Role[],
// ) => {
// 	const userRolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
// 	const requiredRolesArray = Array.isArray(requiredRoles)
// 		? requiredRoles
// 		: [requiredRoles];

// 	return requiredRolesArray.some((role) => userRolesArray.includes(role));
// };
