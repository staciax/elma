import { HTTPError } from '@/errors';
// import { prisma } from '@/lib/prisma';
import { security } from '@/security';

import { bearer } from '@elysiajs/bearer';

import { Elysia } from 'elysia';

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
			const user = await findUserById(data.sub);
			if (!user) {
				throw new HTTPError(401, 'Unauthorized');
			}
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
			const user = await findUserById(data.sub);
			if (!user) {
				throw new HTTPError(401, 'Unauthorized');
			}
			if (!user.is_superuser) {
				throw new HTTPError(403, 'Forbidden');
			}
			return { user };
		});
