import { env } from '@/config';
import { getPasswordHash } from '@/security';

async function init() {
	const email = env.FIRST_SUPERUSER;
	const password = env.FIRST_SUPERUSER_PASSWORD;
	const hashed_password = await getPasswordHash(password);
}

async function main() {
	console.log('Creating initial data');
	await init();
	console.log('Initial data created');
}

await main();
