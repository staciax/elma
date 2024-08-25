import { Elysia } from 'elysia';

export const router = new Elysia({
	prefix: '/orders',
	tags: ['orders'],
})
	.get('/', async () => '/')
	.get('/:id', async ({ params: { id } }) => id)
	.post('/', async ({ body }) => body)
	.patch('/:id', async ({ body, params: { id } }) => [id, body])
	.delete('/:id', async ({ params: { id } }) => id);
