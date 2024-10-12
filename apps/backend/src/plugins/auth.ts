import { pool } from '@/db';
import { UserRoles } from '@/enums';
import { HTTPError } from '@/errors';
import { security } from '@/security';
import type { UserRow } from '@/types/users';

import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';

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

// const getCurrentUser = async (conn: PoolConnection, userId: string) => {
// 	const stmt = 'SELECT * FROM users WHERE id = ?';
// 	const [results] = await conn.execute<UserRow[]>(stmt, [userId]);
// 	// conn.release();
// 	// const conn = await pool.getConnection();
// };

export const currentUser = new Elysia({ name: 'current-user' })
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
			throw new HTTPError(403, 'Could not validate credentials');
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
// .macro(({ onBeforeHandle }) => ({
// 	requiredRoles(roles: UserRoles[]) {
// 		onBeforeHandle(async ({ user }) => {
// 			if (!user) {
// 				throw new HTTPError(401, 'Unauthorized');
// 			}

// 			if (user.role === UserRoles.SUPERUSER) {
// 				return;
// 			}

// 			if (!roles.includes(user.role)) {
// 				throw new HTTPError(403, 'Forbidden');
// 			}
// 		});
// 	},
// }));

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
				throw new HTTPError(403, 'Could not validate credentials');
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

			if (user.role !== UserRoles.SUPERUSER) {
				throw new HTTPError(403, 'Forbidden');
			}

			return { user };
		});

// export const rolePlugin = new Elysia({ name: 'role' })
// 	.use(bearer())
// 	.use(security)
// 	.derive({ as: 'scoped' }, async ({ jwt, bearer }) => {
// 		// validate token
// 		if (!bearer) {
// 			throw new HTTPError(401, 'Not authenticated', {
// 				'WWW-Authenticate': 'Bearer',
// 			});
// 		}

// 		const jwtPayload = await jwt.verify(bearer);
// 		if (!jwtPayload) {
// 			throw new HTTPError(401, 'Not authenticated');
// 		}

// 		// get user
// 		const conn = await pool.getConnection();

// 		const stmt = 'SELECT * FROM users WHERE id = ?';
// 		const [results] = await conn.execute<UserRow[]>(stmt, [jwtPayload.sub]);

// 		conn.release();

// 		if (!results.length) {
// 			throw new HTTPError(404, 'User not found');
// 		}
// 		const user = results[0];

// 		if (!user.is_active) {
// 			throw new HTTPError(400, 'Inactive user');
// 		}

// 		return { user };
// 	})
// 	.macro(({ onBeforeHandle }) => ({
// 		requiredRoles(roles: UserRoles[]) {
// 			onBeforeHandle(async ({ user }) => {
// 				if (!user) {
// 					throw new HTTPError(401, 'Unauthorized');
// 				}

// 				if (user.role === UserRoles.SUPERUSER) {
// 					return;
// 				}

// 				if (!roles.includes(user.role)) {
// 					throw new HTTPError(403, 'Forbidden');
// 				}
// 			});
// 		},
// 	}));

// export const hasRequiredRoles = (
// 	user: UserRow,
// 	roles?: UserRoles | UserRoles[],
// ) => {
// 	if (user.role === UserRoles.SUPERUSER) {
// 		return true;
// 	}

// 	const rolesArray = Array.isArray(roles) ? roles : [roles];

// 	return rolesArray.includes(user.role);

// 	// if (!rolesArray.includes(user.role)) {
// 	// 	throw new HTTPError(403, 'Forbidden');
// 	// }
// };

// export const requiredRoles = () => {
// 	return new Elysia({ name: 'role' });
// 	// .use(bearer())
// 	// .use(security)
// 	// .use(currentUser())
// 	// .macro(({ onBeforeHandle }) => ({
// 	// 	hasRequiredRoles(roles: boolean[]) {
// 	// 		// if (!roles) return;

// 	// 		onBeforeHandle(async ({ user }) => {
// 	// 			console.log(user);
// 	// 			// if (!bearer) {
// 	// 			// 	set.headers['WWW-Authenticate'] = 'Bearer';
// 	// 			// 	throw new HTTPError(401, 'Unauthorized');
// 	// 			// }
// 	// 			// const jwtPayload = await jwt.verify(bearer);
// 	// 			// if (!jwtPayload) {
// 	// 			// 	throw new HTTPError(401, 'Unauthorized');
// 	// 			// }
// 	// 			// const conn = await pool.getConnection();

// 	// 			// const stmt = 'SELECT * FROM users WHERE id = ?';
// 	// 			// const [results] = await conn.execute<UserRow[]>(stmt, [
// 	// 			// 	jwtPayload.sub,
// 	// 			// ]);
// 	// 			// conn.release();

// 	// 			// if (!results.length) {
// 	// 			// 	throw new HTTPError(401, 'Unauthorized');
// 	// 			// }
// 	// 			// const user = results[0];

// 	// 			// // TODO: user?.role or user.role
// 	// 			// if (user?.role !== UserRoles.SUPERUSER) {
// 	// 			// 	throw new HTTPError(403, 'Forbidden');
// 	// 			// }

// 	// 			// if (!token.value)
// 	// 			// 	return error(401, {
// 	// 			// 		success: false,
// 	// 			// 		message: 'Unauthorized',
// 	// 			// 	});
// 	// 			// const username = session[token.value as unknown as number];
// 	// 			// if (!username)
// 	// 			// 	return error(401, {
// 	// 			// 		success: false,
// 	// 			// 		message: 'Unauthorized',
// 	// 			// 	});
// 	// 		});
// 	// 	},
// 	// }))

// 	// .macro(({ onBeforeHandle }) => ({
// 	// 	auth(enabled: true) {
// 	// 		if (!enabled) return;
// 	// 		onBeforeHandle(async ({ user }) => {
// 	// 			console.log(user);
// 	// 			// if (!bearer) {
// 	// 			// 	set.headers['WWW-Authenticate'] = 'Bearer';
// 	// 			// 	throw new HTTPError(401, 'Unauthorized');
// 	// 			// }
// 	// 			// const jwtPayload = await jwt.verify(bearer);
// 	// 			// if (!jwtPayload) {
// 	// 			// 	throw new HTTPError(401, 'Unauthorized');
// 	// 			// }
// 	// 			// const conn = await pool.getConnection();

// 	// 			// const stmt = 'SELECT * FROM users WHERE id = ?';
// 	// 			// const [results] = await conn.execute<UserRow[]>(stmt, [
// 	// 			// 	jwtPayload.sub,
// 	// 			// ]);
// 	// 			// conn.release();

// 	// 			// if (!results.length) {
// 	// 			// 	throw new HTTPError(401, 'Unauthorized');
// 	// 			// }
// 	// 			// const user = results[0];

// 	// 			// // TODO: user?.role or user.role
// 	// 			// if (user?.role !== UserRoles.SUPERUSER) {
// 	// 			// 	throw new HTTPError(403, 'Forbidden');
// 	// 			// }

// 	// 			// if (!token.value)
// 	// 			// 	return error(401, {
// 	// 			// 		success: false,
// 	// 			// 		message: 'Unauthorized',
// 	// 			// 	});
// 	// 			// const username = session[token.value as unknown as number];
// 	// 			// if (!username)
// 	// 			// 	return error(401, {
// 	// 			// 		success: false,
// 	// 			// 		message: 'Unauthorized',
// 	// 			// 	});
// 	// 		});
// 	// 	},
// 	// }))

// 	// .use(currentUser())
// 	// .onAfterResponse(async ({ user }) => {
// 	// 	console.log(user);
// 	// 	hasRequiredRoles(user, rolesArray);
// 	// })
// 	// .use(bearer())
// 	// .use(security)
// 	// .resolve(async ({ user }) => {})
// 	// .derive({ as: 'scoped' }, async ({ user }) => {
// 	// 	console.log(user);
// 	// 	// if (!bearer) {
// 	// 	// 	set.headers['WWW-Authenticate'] = 'Bearer';
// 	// 	// 	throw new HTTPError(401, 'Unauthorized');
// 	// 	// }
// 	// 	// const jwtPayload = await jwt.verify(bearer);
// 	// 	// if (!jwtPayload) {
// 	// 	// 	throw new HTTPError(401, 'Unauthorized');
// 	// 	// }
// 	// 	// const conn = await pool.getConnection();

// 	// 	// const stmt = 'SELECT * FROM users WHERE id = ?';
// 	// 	// const [results] = await conn.execute<UserRow[]>(stmt, [jwtPayload.sub]);
// 	// 	// conn.release();

// 	// 	// if (!results.length) {
// 	// 	// 	throw new HTTPError(401, 'Unauthorized');
// 	// 	// }

// 	// 	// const user = results[0];

// 	// 	// const hasRole = hasRequiredRoles(user, roles);

// 	// 	// if (!hasRole) {
// 	// 	// 	throw new HTTPError(403, 'Forbidden');
// 	// 	// }
// 	// })
// };

// export const hasRequiredRoles = (
// 	roles: UserRoles | UserRoles[],
// ): ((context: Context) => Promise<void>) => {
// 	const inner = async ({ user }: { user: UserRow }) => {
// 		// const rolesArray = Array.isArray(roles) ? roles : [roles];
// 		// const { set, jwt, bearer } = context;
// 		// if (!bearer) {
// 		// 	set.headers['WWW-Authenticate'] = 'Bearer';
// 		// 	throw new HTTPError(401, 'Unauthorized');
// 		// }
// 		// const jwtPayload = await jwt.verify(bearer);
// 		// if (!jwtPayload) {
// 		// 	throw new HTTPError(401, 'Unauthorized');
// 		// }
// 		// const conn = await pool.getConnection();
// 		// const stmt = 'SELECT * FROM users WHERE id = ?';
// 		// const [results] = await conn.execute<UserRow[]>(stmt, [jwtPayload.sub]);
// 		// conn.release();
// 		// if (!results.length) {
// 		// 	throw new HTTPError(401, 'Unauthorized');
// 		// }
// 		// const user = results[0];
// 		// if (!rolesArray.includes(user.role)) {
// 		// 	throw new HTTPError(403, 'Forbidden');
// 		// }
// 		// context.user = user;
// 	};

// 	return inner;
// };
// export const hasRequiredRoles = (roles: UserRoles | UserRoles[]) => {
// 	const rolesArray = Array.isArray(roles) ? roles : [roles];

// 	return new Elysia({ name: 'superuser' })
// 		.use(bearer())
// 		.use(security)
// 		.derive({ as: 'scoped' }, async ({ set, jwt, bearer }) => {
// 			if (!bearer) {
// 				set.headers['WWW-Authenticate'] = 'Bearer';
// 				throw new HTTPError(401, 'Unauthorized');
// 			}
// 			const jwtPayload = await jwt.verify(bearer);
// 			if (!jwtPayload) {
// 				throw new HTTPError(401, 'Unauthorized');
// 			}
// 			const conn = await pool.getConnection();

// 			const stmt = 'SELECT * FROM users WHERE id = ?';
// 			const [results] = await conn.execute<UserRow[]>(stmt, [jwtPayload.sub]);
// 			conn.release();

// 			if (!results.length) {
// 				throw new HTTPError(401, 'Unauthorized');
// 			}
// 			const user = results[0];

// 			if (!rolesArray.includes(user.role)) {
// 				throw new HTTPError(403, 'Forbidden');
// 			}

// 			return { user };
// 		});
// };

// export const hasSuperuserRole = hasRequiredRoles(UserRoles.SUPERUSER);
// export const hasAdminRole = hasRequiredRoles(UserRoles.ADMIN);
// export const hasManagerRole = hasRequiredRoles(UserRoles.MANAGER);
// export const hasMemberRole = hasRequiredRoles(UserRoles.MEMBER);
// const permissions = (context: any) => {
// 	console.log(context);
// 	return context;
// 	// return new Elysia({ name: 'permissions' })
// 	// 	.use(bearer())
// 	// 	.use(security)
// 	// 	.derive({ as: 'scoped' }, async ({ set, jwt, bearer }) => {
// 	// 		if (!bearer) {
// 	// 			set.headers['WWW-Authenticate'] = 'Bearer';
// 	// 			throw new HTTPError(401, 'Unauthorized');
// 	// 		}
// 	// 		const jwtPayload = await jwt.verify(bearer);
// 	// 		if (!jwtPayload) {
// 	// 			throw new HTTPError(401, 'Unauthorized');
// 	// 		}
// 	// 	});
// };

// abstract class BasePermission {
// 	abstract hasRequiredPermissions(context: Context): boolean;
// }

// class Permission {
// 	permissions_classes: [];

// 	constructor(permissions_classes: []) {
// 		this.permissions_classes = permissions_classes;
// 	}

// 	public call(context: Context) {
// 		return this.hasRequiredPermissions(context);
// 	}

// 	hasRequiredPermissions(context: Context) {
// 		return true;
// 	}
// }

// 	private context: Context;
// 	constructor(context: Context) {
// 		this.context = context;
// 	}
// }

// class UserCreatePermission extends BasePermission {
// 	hasRequiredPermissions(context: Context) {
// 		return true;
// 	}
// }

// export const permission = (context: string[]) =>
// 	new Elysia({ name: 'permission' });

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
