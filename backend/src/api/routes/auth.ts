import { Elysia } from 'elysia';
import { jwt } from '../../core/security';

export const router = new Elysia({ prefix: '/auth' })
	.use(jwt)
	.get('/access-token', async ({ jwt, cookie: { auth } }) => {
		auth.set({
			value: await jwt.sign({ name: 'test' }),
			httpOnly: true,
			maxAge: 7 * 86400,
			path: '/me',
		});
		return {
			access_token: auth.value,
		};
	})
	.get('/test-token', async ({ jwt, set, cookie: { auth } }) => {
		const profile = await jwt.verify(auth.value);
		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}

		return `Hello ${profile.name}`;
	});
