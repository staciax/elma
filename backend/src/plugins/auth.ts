import { pool } from '@/db';
import { HTTPError } from '@/errors';
import { security } from '@/security';
import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';
import type { RowDataPacket } from 'mysql2/promise';

async function findUserById(userId: string) {
	// return prisma.user.findUnique({
	// 	where: {
	// 		id: userId,
	// 	},
	// });
	return {};
}

// TODO: role-based access control
type UserRole = {
	role?: 'user' | 'admin';
	isSuperuser?: boolean;
};

enum Role {
	SUPERUSER = 'SUPERUSER',
	ADMIN = 'ADMIN',
	MANAGER = 'MANAGER',
	EMPLOYEE = 'EMPLOYEE',
	CUSTOMER = 'CUSTOMER',
}

// TODO: remove duplicate code

export const currentUser = (_role?: UserRole) =>
	new Elysia({ name: 'current-user' })
		.use(bearer())
		.use(security)
		.derive({ as: 'scoped' }, async ({ set, jwt, bearer }) => {
			if (!bearer) {
				set.headers['WWW-Authenticate'] = 'Bearer';
				throw new HTTPError(401, 'Unauthorized');
			}
			const data = await jwt.verify(bearer);
			if (!data) {
				throw new HTTPError(401, 'Unauthorized');
			}
			const conn = await pool.getConnection();

			const [user_results] = await conn.query<RowDataPacket[]>(
				'SELECT * FROM users WHERE id=?',
				[data.sub],
			);

			if (!user_results.length) {
				throw new HTTPError(401, 'Unauthorized');
			}
			const user = user_results[0];

			// const user = await findUserById(data.sub);
			// if (!user) {
			// 	throw new HTTPError(401, 'Unauthorized');
			// }

			return { user };
		});

export const superuser = () =>
	new Elysia({ name: 'superuser' })
		.use(bearer())
		.use(security)
		.derive({ as: 'scoped' }, async ({ set, jwt, bearer }) => {
			if (!bearer) {
				set.headers['WWW-Authenticate'] = 'Bearer';
				throw new HTTPError(401, 'Unauthorized');
			}
			const data = await jwt.verify(bearer);

			if (!data) {
				throw new HTTPError(401, 'Unauthorized');
			}
			const conn = await pool.getConnection();

			const [user_results] = await conn.query<RowDataPacket[]>(
				'SELECT * FROM users WHERE id=?',
				[data.sub],
			);
			conn.release();

			if (!user_results.length) {
				throw new HTTPError(401, 'Unauthorized');
			}
			const user = user_results[0];

			// TODO: user?.role or user.role
			if (user?.role !== 'SUPERUSER') {
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
