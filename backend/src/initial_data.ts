import { env } from '@/config';
import { prisma } from '@/lib/prisma';
import { getPasswordHash } from '@/security';
import { Prisma } from '@prisma/client';

async function init() {
	const email = env.FIRST_SUPERUSER;
	if (!email) {
		throw new Error('No superuser email provided');
	}
	const password = env.FIRST_SUPERUSER_PASSWORD;
	if (!password) {
		throw new Error('No superuser password provided');
	}
	const hashed_password = await getPasswordHash(password);

	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!user) {
		await prisma.user.create({
			data: {
				email,
				hashed_password,
				is_superuser: true,
				is_staff: true,
				is_active: true,
			},
		});
	}

	const publisher = await prisma.publisher.create({
		data: {
			name: 'Publisher 1',
		},
	});

	const category = await prisma.category.create({
		data: {
			name: 'Category 1',
		},
	});

	const series = await prisma.series.create({
		data: {
			name: 'Series 1',
		},
	});

	const author_1 = await prisma.author.create({
		data: {
			first_name: 'Author 1',
			last_name: '1',
		},
	});

	const author_2 = await prisma.author.create({
		data: {
			first_name: 'Author 2',
			last_name: '2',
		},
	});

	const product = await prisma.product.create({
		data: {
			title: 'Product 1',
			description: 'Description 1',
			isbn: '1234567890111',
			price: new Prisma.Decimal(1000),
			published_date: new Date(),
			publisher_id: publisher.id,
			category_id: category.id,
			series_id: series.id,
		},
	});

	await prisma.productImage.createMany({
		data: [
			{
				product_id: product.id,
				url: 'https://example.com/image.jpg',
			},
			{
				product_id: product.id,
				url: 'https://example.com/image2.jpg',
			},
			{
				product_id: product.id,
				url: 'https://example.com/image3.jpg',
			},
		],
	});

	await prisma.productAuthor.createMany({
		data: [
			{
				product_id: product.id,
				author_id: author_1.id,
			},
			{
				product_id: product.id,
				author_id: author_2.id,
			},
		],
	});

	await prisma.$disconnect();
}

async function main() {
	console.log('Creating initial data');
	await init();
	console.log('Initial data created');
}

await main();
