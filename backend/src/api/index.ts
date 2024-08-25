import { env } from '@/config';

import { Elysia } from 'elysia';
import { router as authRouter } from './routes/auth';
import { router as authorsRouter } from './routes/authors';
import { router as categoriesRouter } from './routes/categories';
import { router as ordersRouter } from './routes/orders';
import { router as productsRouter } from './routes/products';
import { router as publishersRouter } from './routes/publishers';
import { router as shoppingCartsRouter } from './routes/shopping-carts';
import { router as usersRouter } from './routes/users';

export const router = new Elysia({ prefix: env.API_V1_STR }) //
	.use(authRouter)
	.use(usersRouter)
	.use(authorsRouter)
	.use(publishersRouter)
	.use(categoriesRouter)
	.use(productsRouter)
	.use(shoppingCartsRouter)
	.use(ordersRouter);
