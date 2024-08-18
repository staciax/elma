import z from 'zod';

const envSchema = z.object({
	DATABASE_URL: z
		.string({
			message: 'DATABASE_URL is required',
			required_error: 'DATABASE_URL is required',
		})
		.url(),
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	HOSTNAME: z.string().default('localhost'),
	PORT: z
		.number()
		.positive()
		.max(65535, { message: 'PORT should be >= 0 and <= 65535' })
		.default(8000),
	SECRET_KEY: z.string().default(new Bun.CryptoHasher('sha256').digest('hex')),
	ACCESS_TOKEN_EXPIRE_MINUTES: z.string().default('1d'),
	FIRST_SUPERUSER: z.string().default('admin'),
	FIRST_SUPERUSER_PASSWORD: z.string().default('admin'),
	API_V1_STR: z.string().default('/api/v1'),
});

const envServer = envSchema.safeParse(process.env);

if (!envServer.success) {
	console.error(envServer.error);
	process.exit(1);
}

export const env = envServer.data;
