import { pool } from '@/db';
import { currentUser, superuser } from '@/plugins/auth';
import { Elysia, t } from 'elysia';
// import type { ResultSetHeader, RowDataPacket } from 'mysql2';
// import { v7 as uuidv7 } from 'uuid';

export const router = new Elysia({
	prefix: '/carts',
	tags: ['carts'],
})
	.guard((app) =>
		app
			.use(superuser())
			.get(
				'/',
				async ({ query: { limit, offset } }) => {
					const conn = await pool.getConnection();
					const stmt = `
					SELECT
						*
					FROM
						shopping_carts
					LIMIT ?
					OFFSET ?;
					`;
					const [results] = await conn.query(stmt, [limit, offset]);
					conn.release();
					return results;
				},
				{
					query: t.Object({
						limit: t.Optional(t.Number({ default: 100 })),
						offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
					}),
				},
			)
			.get('/:id', async ({ params: { id } }) => id)
			.post('/', async ({ body }) => body)
			.patch('/:id', async ({ body, params: { id } }) => [id, body])
			.delete('/:id', async ({ params: { id } }) => id),
	)
	.group('/me', (app) =>
		app
			.use(currentUser())
			.get('/', async () => '/')
			.get('/:id', async ({ params: { id } }) => id)
			.post('/', async ({ body }) => body)
			.patch('/:id', async ({ body, params: { id } }) => [id, body])
			.delete('/:id', async ({ params: { id } }) => id),
	);

// TODO: carts me routes
