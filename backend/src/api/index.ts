import { Elysia } from 'elysia';

import { router as authRouter } from './routes/auth';
import { router as authorsRouter } from './routes/authors';
import { router as booksRouter } from './routes/books';
import { router as categoriesRouter } from './routes/categories';
import { router as ordersRouter } from './routes/orders';
import { router as publishersRouter } from './routes/publishers';
import { router as shoppingCartsRouter } from './routes/shopping-carts';
import { router as usersRouter } from './routes/users';

// https://elysiajs.com/essential/plugin.html#plugin-deduplication
export const apiRouter = <T extends string>(config: { prefix: T }) =>
	new Elysia({
		prefix: config.prefix,
		name: 'api',
		seed: config,
	})
		.use(authRouter)
		.use(usersRouter)
		.use(authorsRouter)
		.use(publishersRouter)
		.use(categoriesRouter)
		.use(booksRouter)
		.use(shoppingCartsRouter)
		.use(ordersRouter);

// TODO: add begin transaction for all routes except GET
