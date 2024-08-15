import { Elysia } from 'elysia';

import { router as authRouter } from './routes/auth';
import { router as productRouter } from './routes/products';
import { router as userRouter } from './routes/users';

const API_V1_STR = Bun.env.API_V1_STR || '/api/v1';

export const router = new Elysia({ prefix: API_V1_STR }) //
	.use(authRouter)
	.use(userRouter)
	.use(productRouter);
