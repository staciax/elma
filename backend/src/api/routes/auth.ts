import { pool } from '@/db';
import { security } from '@/security';
import { Elysia, t } from 'elysia';

import { HTTPError } from '@/errors';
import { Message } from '@/schemas/message';
import { SignInDTO } from '@/schemas/users';
import { verifyPassword } from '@/security';

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
			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				throw new HTTPError(404, 'User not found');
			}

			const isMatch = await verifyPassword(password, user.hashed_password);

			if (!isMatch) {
				throw new HTTPError(400, 'Invalid password');
			}

			const accessToken = await jwt.sign({ sub: user.id });

			return { accessToken };
		},
		{
			body: 'user.sign-in',
			response: { 200: 'token' },
		},
	);
