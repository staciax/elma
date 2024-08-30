import { router as apiRouter } from '@/api';
import { env } from '@/config';
import { HTTPError } from '@/errors';
import { Message } from '@/schemas/message';

import { logger } from '@bogeychan/elysia-logger';
import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

export const app = new Elysia()
	.use(
		logger({
			level: env.NODE_ENV === 'production' ? 'info' : 'debug',
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
		//{ as: 'global' },
		switch (code) {
			case 'HTTPError':
				set.status = error.status;
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

	// TODO: docs auth https://github.com/elysiajs/elysia-swagger/blob/main/example/index2.ts
	.use(staticPlugin({ assets: 'public', prefix: '/public', staticLimit: 1024 }))
	.use(apiRouter);

if (env.NODE_ENV !== 'production') {
	app.use(
		swagger({
			path: '/docs',
			// provider: 'swagger-ui',
			documentation: {
				security: [{ JwtAuth: [], OAuth2PasswordBearer: [] }],
				components: {
					securitySchemes: {
						JwtAuth: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'JWT',
							description: 'Enter JWT Bearer token **_only_**',
						},
						OAuth2PasswordBearer: {
							type: 'oauth2',
							description: 'OAuth2 Password Bearer',
							flows: {
								password: {
									tokenUrl: `${env.API_V1_STR}/auth/sign`,
									scopes: {},
								},
							},
						},
					},
				},
			},
		}),
	);
	app.get('/', ({ redirect }) => redirect('/docs'));
}

if (env.BACKEND_CORS_ORIGINS) {
	app.use(
		cors({
			origin: env.BACKEND_CORS_ORIGINS,
			credentials: true,
			methods: ['*'],
			allowedHeaders: ['*'],
		}),
	);
}

export type App = typeof app;

// TODO: @bogeychan/elysia-logger https://github.com/bogeychan/elysia-logger
// TODO: logger: https://github.com/pinojs/pino
// TODO: openapi hide file
