import { env } from '@/config';

import { Elysia } from 'elysia';
import { router as authRouter } from './routes/auth';
import { router as authorRouter } from './routes/authors';
import { router as categoryRouter } from './routes/categories';
import { router as orderRouter } from './routes/orders';
import { router as productRouter } from './routes/products';
import { router as publisherRouter } from './routes/publishers';
import { router as shoppingCartRouter } from './routes/shopping-carts';
import { router as userRouter } from './routes/users';

export const router = new Elysia({ prefix: env.API_V1_STR }) //
	.use(authRouter)
	.use(userRouter)
	.use(authorRouter)
	.use(publisherRouter)
	.use(categoryRouter)
	.use(productRouter)
	.use(shoppingCartRouter)
	.use(orderRouter);
