import { env } from '@/config';

import { Elysia } from 'elysia';
import { router as authRouter } from './routes/auth';
import { router as productRouter } from './routes/products';
import { router as userRouter } from './routes/users';

export const router = new Elysia({ prefix: env.API_V1_STR }) //
	.use(authRouter)
	.use(userRouter)
	.use(productRouter);
