import z from 'zod';

const envSchema = z
	.object({
		API_V1_STR: z
			.string()
			.trim()
			.startsWith('/', { message: "A path prefix must start with '/'" })
			.refine((value) => !value.endsWith('/'), {
				message:
					"A path prefix must not end with '/', as the routes will start with '/'",
			})
			.default('/api/v1')
			.describe('API version'),
		MYSQL_HOST: z
			.string()
			.min(1)
			.default('localhost') // TODO: wait for support hostname https://github.com/colinhacks/zod/pull/3692 or url or ip?
			.describe('MySQL host'),
		MYSQL_PORT: z
			.number({ coerce: true })
			.int()
			.positive()
			.default(3306)
			.describe('MySQL port'),
		MYSQL_DB: z //
			.string()
			.min(1)
			.max(128)
			.describe('MySQL database name'),
		MYSQL_USER: z //
			.string()
			.min(1)
			.max(16)
			.describe('MySQL user'),
		MYSQL_PASSWORD: z //
			.string()
			.min(1)
			.max(128)
			.describe('MySQL password'),
		// DATABASE_URL: z // NOTE: computed value from MYSQL_* variables
		// 	.string()
		// 	.url()
		// 	.describe('Database connection URL'),
		NODE_ENV: z
			.enum(['development', 'test', 'production'], {
				message: 'NODE_ENV must be one of "development", "test", "production"',
			})
			.default('development')
			.describe('Node environment'),
		BACKEND_CORS_ORIGINS: z
			.string()
			.optional()
			.transform((value) => (value ? value.split(',') : undefined))
			.pipe(
				z
					.union([z.string().trim().url(), z.literal('*')])
					.array()
					.optional(),
			)
			.describe('Comma-separated list of origins for the CORS policy'),
		HOSTNAME: z
			.string()
			.default('localhost') // TODO: wait for support hostname https://github.com/colinhacks/zod/pull/3692
			.describe('API hostname'),
		PORT: z
			.number({
				coerce: true,
				message: 'PORT must be a number',
			})
			.int()
			.positive({ message: 'PORT must be a positive number' })
			.min(1000, { message: 'PORT should be >= 1000 and < 65536' })
			.max(65535, { message: 'PORT should be >= 1000 and < 65536' })
			.default(8000)
			.describe('API port'),
		SECRET_KEY: z
			.string()
			.default(new Bun.CryptoHasher('sha256').digest('hex'))
			.describe('Secret key for hashing'),
		ACCESS_TOKEN_EXPIRE: z
			.string()
			.default('1d')
			.refine((value) => /^\d+[smhdwMy]$/.test(value))
			.describe('Access token expiration time'),
		FIRST_SUPERUSER: z
			.string({
				message: 'FIRST_SUPERUSER is required',
			})
			.email({
				message: 'FIRST_SUPERUSER must be a valid email',
			})
			.describe('First superuser email'),
		FIRST_SUPERUSER_PASSWORD: z
			.string({
				message: 'FIRST_SUPERUSER_PASSWORD is required',
			})
			.min(8, {
				message: 'FIRST_SUPERUSER_PASSWORD must be at least 8 characters',
			})
			.describe('First superuser password'),
	})
	.transform((values) => ({
		// Thanks https://github.com/colinhacks/zod/issues/1454#issuecomment-1272260555
		...values,
		get DATABASE_URI() {
			const uri = z
				.string()
				.url()
				.parse(
					`mysql://${values.MYSQL_USER}:${values.MYSQL_PASSWORD}@${values.MYSQL_HOST}:${values.MYSQL_PORT}/${values.MYSQL_DB}`,
				);
			return uri;
		},
	}))
	.readonly();

const envServer = envSchema.safeParse(Bun.env);

if (!envServer.success) {
	console.error('Invalid environment variables, check the errors below!');
	console.error(envServer.error.issues);
	process.exit(1);
}

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envServer.data;
