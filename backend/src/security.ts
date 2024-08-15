import { jwt } from '@elysiajs/jwt';
import { t } from 'elysia';

const ALGORITHM = 'HS256';

export const security = jwt({
	name: 'jwt',
	secret: Bun.env.SECRET_KEY || new Bun.CryptoHasher('sha256').digest('hex'),
	alg: ALGORITHM,
	exp: Bun.env.EXPIRES_IN || '1d',
	schema: t.Object({
		sub: t.String(),
	}),
});

export async function verifyPassword(
	plainPassword: string,
	hashedPassword: string,
) {
	return await Bun.password.verify(plainPassword, hashedPassword, 'bcrypt');
}

export async function getPasswordHash(password: string) {
	return await Bun.password.hash(password, {
		algorithm: 'bcrypt',
		cost: 10,
	});
}
