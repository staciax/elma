import z from 'zod';

const envSchema = z
	.object({
		API_V1_STR: z
			.string({
				description: 'API version',
			})
			.trim()
			.startsWith('/', { message: "A path prefix must start with '/'" })
			.refine((value) => !value.endsWith('/'), {
				message:
					"A path prefix must not end with '/', as the routes will start with '/'",
			})
			.default('/api/v1'),
		DATABASE_URL: z
			.string({
				message: 'DATABASE_URL is required',
				description: 'Database connection URL',
			})
			.url(),
		NODE_ENV: z
			.enum(['development', 'production', 'test'], {
				message: 'NODE_ENV must be one of "development", "production", "test"',
				description: 'Node environment',
			})
			.default('development'),
		BACKEND_CORS_ORIGINS: z
			.string({
				description: 'Comma-separated list of origins for the CORS policy',
			})
			.optional()
			.transform((value) => (value ? value.split(',') : undefined))
			.pipe(
				z
					.union([z.string().trim().url(), z.literal('*')])
					.array()
					.default([]),
			),
		HOSTNAME: z
			.string({
				description: 'API hostname',
			})
			.default('localhost'), // TODO: wait for support hostname https://github.com/colinhacks/zod/pull/3692
		PORT: z
			.number({
				coerce: true,
				message: 'PORT must be a number',
				description: 'API port',
			})
			.positive({ message: 'PORT must be a positive number' })
			.min(1000, { message: 'PORT should be >= 1000 and < 65536' })
			.max(65535, { message: 'PORT should be >= 1000 and < 65536' })
			.default(8000),
		SECRET_KEY: z
			.string({
				description: 'Secret key for hashing',
			})
			.default(new Bun.CryptoHasher('sha256').digest('hex')),
		ACCESS_TOKEN_EXPIRE: z
			.string({
				description: 'Access token expiration time',
			})
			.default('1d')
			.refine((value) => /^\d+[smhdwMy]$/.test(value)),
		FIRST_SUPERUSER: z
			.string({
				message: 'FIRST_SUPERUSER is required',
				description: 'First superuser email',
			})
			.email(),
		FIRST_SUPERUSER_PASSWORD: z.string({
			message: 'FIRST_SUPERUSER_PASSWORD is required',
			description: 'First superuser password',
		}),
	})
	.readonly();

const envServer = envSchema.safeParse(Bun.env);

if (!envServer.success) {
	console.error('Invalid environment variables, check the errors below!');
	console.error(envServer.error.issues);
	process.exit(1);
}

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envServer.data;
