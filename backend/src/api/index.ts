import { Elysia } from 'elysia';

import { router as auth_router } from './routes/auth';

export const router = new Elysia({ prefix: '/api' }).use(auth_router);
