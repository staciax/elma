import { router as apiRouter } from '@/api';
import { HTTPError } from '@/errors';
import { Message } from '@/schemas/message';

import { logger } from '@bogeychan/elysia-logger';
import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { env } from './config';

export const app = new Elysia()
	.use(
		logger({
			level: 'info',
		}),
	)
	.guard({
		as: 'global',
		response: {
			400: Message,
			404: Message,
			500: Message,
		},
	})

	// Error handlers
	.error({ HTTPError })
	.onError(({ code, error, set }) => {
		switch (code) {
			case 'HTTPError':
				set.status = error.status_code;
				if (error.headers) {
					set.headers = error.headers;
				}
				return { message: error.message };
			case 'INTERNAL_SERVER_ERROR':
			case 'UNKNOWN':
				set.status = 500;
				return { message: error.toString() };
		}
	})

	// Middleware
	.onBeforeHandle(() => {})
	.onAfterHandle(() => {})

	// CORS
	// .use(
	// 	cors(
	// 		env.BACKEND_CORS_ORIGINS.length
	// 			? {
	// 					origin: env.BACKEND_CORS_ORIGINS,
	// 					credentials: true,
	// 					methods: ['*'],
	// 					allowedHeaders: ['*'],
	// 				}
	// 			: undefined,
	// 	),
	// )

	// Docs
	.use(swagger({ path: '/docs' }))
	.get('/', ({ redirect }) => redirect('/docs'))

	// TODO: docs auth https://github.com/elysiajs/elysia-swagger/blob/main/example/index2.ts
	.use(staticPlugin({ assets: 'public', prefix: '/public', staticLimit: 1024 }))
	.use(apiRouter);

if (env.BACKEND_CORS_ORIGINS.length) {
	app.use(
		cors({
			origin: env.BACKEND_CORS_ORIGINS,
			credentials: true,
			methods: ['*'],
			allowedHeaders: ['*'],
		}),
	);
}

// TODO: @bogeychan/elysia-logger https://github.com/bogeychan/elysia-logger
// TODO: logger: https://github.com/pinojs/pino
