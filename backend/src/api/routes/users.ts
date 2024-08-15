import { HTTPError } from '@/errors';
import { prisma } from '@/lib/prisma';
import { currentUser, superuser } from '@/plugins/auth';
import { Message } from '@/schemas/message';
import {
	SignUpDTO,
	UpdatePasswordDTO,
	UserCreate,
	UserMeUpdate,
	UserPublic,
	UserUpdate,
	UsersPublic,
} from '@/schemas/users';
import { getPasswordHash, verifyPassword } from '@/security';

import { Elysia, t } from 'elysia';

export const router = new Elysia({ prefix: '/users', tags: ['users'] })
	.model({
		message: Message,
		user: UserPublic,
		users: UsersPublic,
		'user.create': UserCreate,
		'user.update': UserUpdate,
		'user.me.update': UserMeUpdate,
		'user.sign-up': SignUpDTO,
		'update.password': UpdatePasswordDTO,
	})
	.guard({}, (app) =>
		app
			.use(superuser())
			.get(
				'/',
				async ({ query: { limit, offset } }) => {
					const count = await prisma.user.count();
					const users = await prisma.user.findMany({
						take: limit,
						skip: offset,
					});

					return {
						count,
						data: users,
					};
				},
				{
					query: t.Object({
						limit: t.Optional(t.Number({ default: 100 })),
						offset: t.Optional(t.Number({ default: 0 })),
					}),
					response: {
						200: 'users',
					},
				},
			)
			.get(
				'/:id',
				async ({ params: { id } }) => {
					const user = await prisma.user.findUnique({
						where: {
							id: id,
						},
					});
					if (!user) {
						throw new HTTPError(404, 'User not found');
					}
					return user;
				},
				{
					params: t.Object({
						id: t.String(),
					}),
					response: {
						200: 'user',
					},
				},
			)
			.post(
				'/',
				async ({ set, body: { email, password, ...body } }) => {
					const user = await prisma.user.findUnique({
						where: {
							email: email,
						},
					});

					if (user) {
						throw new HTTPError(400, 'User already exists');
					}

					const hashedPassword = await getPasswordHash(password);

					const userCreate = await prisma.user.create({
						data: {
							...body,
							hashed_password: hashedPassword,
							email: email,
						},
					});
					set.status = 201;
					return userCreate;
				},
				{
					body: 'user.create',
					response: {
						201: 'user',
					},
				},
			)
			.patch(
				'/:id',
				async ({ body, params: { id } }) => {
					const user = await prisma.user.findUnique({
						where: {
							id: id,
						},
					});

					if (!user) {
						throw new HTTPError(404, 'User not found');
					}

					const { email, password } = body;

					const emailUpdate = email ? email.toLowerCase() : undefined;
					const hashedPassword: string | undefined = password
						? await getPasswordHash(password)
						: undefined;

					const userUpdate = await prisma.user.update({
						where: {
							id: id,
						},
						data: {
							...body,
							email: emailUpdate,
							hashed_password: hashedPassword,
						},
					});

					return userUpdate;
				},
				{
					params: t.Object({
						id: t.String(),
					}),
					body: 'user.update',
					response: {
						200: 'user',
					},
				},
			)
			.delete(
				'/:id',
				async ({ params: { id }, user }) => {
					const deleteUser = await prisma.user.findUnique({
						where: {
							id: id,
						},
					});

					if (!deleteUser) {
						throw new HTTPError(404, 'User not found');
					}

					if (deleteUser === user) {
						throw new HTTPError(
							403,
							'Super users are not allowed to delete themselves',
						);
					}

					await prisma.user.delete({
						where: {
							id: id,
						},
					});

					return {
						message: 'User deleted successfully',
					};
				},
				{
					params: t.Object({
						id: t.String(),
					}),
					response: {
						200: 'message',
					},
				},
			),
	)
	.guard({}, (app) =>
		app
			.use(currentUser())
			.get(
				'/me',
				async ({ user }) => {
					return user;
				},
				{
					response: {
						200: 'user',
					},
				},
			)
			.patch(
				'/me',
				async ({ body, user }) => {
					const userUpdate = await prisma.user.update({
						where: {
							id: user.id,
						},
						data: {
							...body,
						},
					});

					return userUpdate;
				},
				{
					body: 'user.me.update',
					response: {
						200: 'user',
					},
				},
			)
			.patch(
				'/me/password',
				async ({ user, body: { password, new_password } }) => {
					const oldPassword = await verifyPassword(
						password,
						user.hashed_password,
					);

					if (!oldPassword) {
						throw new HTTPError(400, 'Invalid password');
					}

					const newHashedPassword = await getPasswordHash(new_password);

					await prisma.user.update({
						where: {
							id: user.id,
						},
						data: {
							hashed_password: newHashedPassword,
						},
					});

					return {
						message: 'Password updated successfully',
					};
				},
				{
					body: 'update.password',
					response: {
						200: 'message',
					},
				},
			)
			.delete(
				'/me',
				async ({ user }) => {
					if (user.is_superuser) {
						throw new HTTPError(
							403,
							'Super users are not allowed to delete themselves',
						);
					}

					await prisma.user.delete({
						where: {
							id: user.id,
						},
					});

					return {
						message: 'User deleted successfully',
					};
				},
				{
					params: t.Object({
						id: t.String(),
					}),
					response: {
						200: 'message',
					},
				},
			),
	)
	.post(
		'/sign-up',
		async ({ body: { email, password, ...body } }) => {
			const user = await prisma.user.findUnique({
				where: { email: email },
			});

			const hashedPassword = await getPasswordHash(password);

			if (user) {
				throw new HTTPError(400, 'User already exists');
			}

			const userCreate = await prisma.user.create({
				data: {
					...body,
					email: email.toLowerCase(),
					hashed_password: hashedPassword,
				},
				// NOTE: preview feature
				// read more: https://www.prisma.io/docs/orm/reference/prisma-client-reference#omit-preview
				// omit: {
				// 	hashedPassword: true,
				// },
			});

			return userCreate;
		},
		{
			body: 'user.sign-up',
			response: {
				200: 'user',
			},
		},
	);
