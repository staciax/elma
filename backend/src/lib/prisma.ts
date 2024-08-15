import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
	// preview features
	// read more: https://www.prisma.io/docs/orm/reference/prisma-client-reference#omit-preview
	// omit: {
	// 	user: {
	// 		hashedPassword: true,
	// 	},
	// },
	// TODO: remove this in production
	errorFormat: 'pretty',
	log: [
		{
			emit: 'event',
			level: 'query',
		},
		{
			emit: 'stdout',
			level: 'error',
		},
		{
			emit: 'stdout',
			level: 'info',
		},
		{
			emit: 'stdout',
			level: 'warn',
		},
	],
});

prisma.$on('query', (e) => {
	console.log(`Query: ${e.query}`);
	console.log(`Params: ${e.params}`);
	console.log(`Duration: ${e.duration} ms`);
	console.log(`Timestamp: ${e.timestamp}`);
});
