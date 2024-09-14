import { env } from '@/config';
import { pool } from '@/db';
import { getPasswordHash } from '@/security';

import { v7 as uuidv7 } from 'uuid';

async function init() {
	const conn = await pool.getConnection();

	const email = env.FIRST_SUPERUSER;
	const password = env.FIRST_SUPERUSER_PASSWORD;
	const hashed_password = await getPasswordHash(password);

	const stmt = `
	INSERT INTO users
	(
		id,
		email,
		hashed_password,
		role,
		is_active
	)
	VALUES
	(
		?,
		?,
		?,
		?,
		?
	);
	`;

	await conn.query(stmt, [uuidv7(), email, hashed_password, 'SUPERUSER', true]);

	conn.release();
	await pool.end();
}

async function main() {
	console.log('Creating initial data');
	await init();
	console.log('Initial data created');
}

await main();
