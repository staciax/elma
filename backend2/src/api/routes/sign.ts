import { Elysia } from 'elysia';
import { jwt } from '../../core/security';

export const router = new Elysia({ prefix: '/login' })
	.use(jwt)
	.get('/sign/:name', async ({ jwt, cookie: { auth }, params }) => {
		auth.set({
			value: await jwt.sign(params),
			httpOnly: true,
			maxAge: 7 * 86400,
			path: '/me',
		});
		return `Sign in as ${auth.value}`;
	})
	.get('/me', async ({ jwt, set, cookie: { auth } }) => {
		const profile = await jwt.verify(auth.value);

		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}

		return `Hello ${profile.name}`;
	});
