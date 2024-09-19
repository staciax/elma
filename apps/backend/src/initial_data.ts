import { env } from '@/config';
import { pool } from '@/db';
import { getPasswordHash } from '@/security';

import { v7 as uuidv7 } from 'uuid';

const authors = [
	{
		id: '01920132-5a9e-788d-8534-5f65b7c566ce',
		name: 'Tatsuya Endo',
	},
	{
		id: '01920132-9f11-7ffb-bc0e-3bddafef4cde',
		name: 'Fuse/Taiki Kawakami',
	},
	{
		id: '01920132-bac5-7dd7-ac26-4463fbf082b2',
		name: 'Mitz Vah',
	},
	{
		id: '0192013d-bd57-7449-83d7-cc08f601e2de',
		name: 'Yuka Fujikawa',
	},
];

const categories = [
	{
		id: '0192012d-055a-7557-b09c-bea0de35ee15',
		name: 'ผจญภัย',
	},
	{
		id: '01920131-72bc-7ffb-8114-de4bd19d6f64',
		name: 'คอเมดี้',
	},
];

const publishers = [
	{
		id: '0192012a-63be-700e-a148-e66a74adee3e',
		name: 'เดกซ์เพรส',
	},
	{
		id: '0192012a-8683-7ee2-8da2-1d79ad2aab13',
		name: 'รักพิมพ์ พับลิชชิ่ง',
	},
	{
		id: '01920137-5f47-7116-83ee-944ee0ed0c42',
		name: 'Siam Inter Comics',
	},
];

const books = [
	{
		id: '01920129-d06e-722c-a123-1b96396b0389',
		title: 'เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว 1',
		description:
			'ทั้งที่คิดว่าตัวเองถูกคนร้ายแปลกหน้าแทงตายไปแล้วแต่กลับกลายเป็นว่าได้มาเกิดใหม่เป็นสไลม์ต่างโลกไปซะงั้น!?\nความสามารถในการช่วงชิงความสามารถของศัตรู "นักล่าเหยื่อ" และความสามารถในการล่วงรู้หลักการของโลก "มหาปราชญ์"\nด้วยความสามารถสุดพิเศษทั้งสองนี้เอง การผจญภัยครั้งยิ่งใหญ่ของสไลม์ตัวนี้จึงได้เริ่มต้นขึ้น !',
		cover_image:
			'https://img.fictionlog.co/ebooks/users/5ee338c8a04dcb001b06ec12/cover-images/MtZOUFWy8LLqirc4vCzTJDGs.jpeg',
		price: 76.0,
		physical_price: 75.0,
		isbn: '9786163735362',
		published_date: '2020-06-15',
		is_active: true,
		publisher_id: '0192012a-8683-7ee2-8da2-1d79ad2aab13',
		category_id: '0192012d-055a-7557-b09c-bea0de35ee15',
		author_ids: [
			'01920132-9f11-7ffb-bc0e-3bddafef4cde',
			'01920132-bac5-7dd7-ac26-4463fbf082b2',
		],
	},
	{
		id: '01920129-ea46-7eea-ac76-f871bc56cfe9',
		title: 'เกิดใหม่ทั้งทีก็เป็นสไลม์ไปซะแล้ว 2',
		description:
			'หลังจากที่เดินทางมาที่อาณาจักรคนแคระ เพื่อตามหาผู้มีฝีมือด้านวิชาช่าง พวกริมุรุกลับมีปัญหากับรัฐมนตรีเยสเตอร์จนต้องขึ้นศาล ท่ามกลางการดำเนินคดี ที่ตกเป็นฝ่ายเสียเปรียบอย่างสิ้นเชิงเพราะเล่ห์เหลี่ยมของเยสเตอร์ ผลการตัดสินระหว่างผู้กล้ากับอาณาจักรคนแคระอันโด่งดังก็มาถึง!\nแล้วชะตากรรมของพวกริมุรุจะลงเอยอย่างไรกัน!?',
		cover_image:
			'https://img.fictionlog.co/ebooks/users/5ee338c8a04dcb001b06ec12/cover-images/B0uf2nYjqsbjJbPLf1OSXhQ8.jpeg',
		price: 76.0,
		physical_price: 75.0,
		isbn: '9786163737458',
		published_date: '2020-06-15',
		is_active: true,
		publisher_id: '0192012a-8683-7ee2-8da2-1d79ad2aab13',
		category_id: '0192012d-055a-7557-b09c-bea0de35ee15',
		author_ids: [
			'01920132-9f11-7ffb-bc0e-3bddafef4cde',
			'01920132-bac5-7dd7-ac26-4463fbf082b2',
		],
	},
	{
		id: '0192012a-1898-7779-bd2b-94cb8e8982f4',
		description:
			'“โธ่เว้ย... เป็นชีวิตที่ไม่เข้าท่าเอาซะเลย... อา ถ้ารีเซ็ตชีวิตใหม่ได้อีกครั้งล่ะก็...” หนุ่มโสดซิงไม่มีงานทำวัย 34 ปีถูกรถบรรทุกชนเข้า เขาน่าจะตายไปแล้ว แต่กลับตื่นขึ้นมาในโลกต่างมิติแห่งดาบและเวทมนตร์ในร่างของเด็กทารก!! เขาตัดสินใจว่า “คราวนี้แหละจะมีชีวิตอยู่อย่างเอาจริงแล้ว...!” ชีวิตใหม่ของเขาจะเป็นอย่างไร!? เรื่องราวแฟนตาซีแนวอวตารรีเซ็ตชีวิตใหม่มาแล้ว!!',
		title: 'เกิดชาตินี้พี่ต้องเทพ เล่ม 1',
		cover_image:
			'https://img.fictionlog.co/ebooks/users/5bac9d30c9ca900028452570/cover-images/JU2mpwMfHddV05VSvVGP5w6o.jpeg',
		price: 59.0,
		physical_price: 80,
		isbn: '9786163631473',
		published_date: '2020-05-05',
		is_active: true,
		publisher_id: '0192012a-63be-700e-a148-e66a74adee3e',
		category_id: '0192012d-055a-7557-b09c-bea0de35ee15',
		author_ids: ['0192013d-bd57-7449-83d7-cc08f601e2de'],
	},
	{
		id: '0192012a-3c74-7cc4-a676-199f32c56bf6',
		title: 'เกิดชาตินี้พี่ต้องเทพ เล่ม 2',
		description:
			'“ถ้ารีเซ็ตชีวิตได้อีกสักครั้งละก็...” บททดสอบเพื่อการมีชีวิตอยู่อย่างจริงจัง ที่ถาโถมเข้าใส่รูเดียส อดีตนีตอายุ 34 ปี ซึ่งมาเกิดใหม่ในโลกต่างมิติแห่งดาบและเวทมนตร์… สิ่งที่รอคอยเขาอยู่ก็คือคุณหนูจอมอาละวาดสุดๆ!! ทั้งที่หวาดกลัวต่อความป่าเถื่อนนั่น รูเดียสที่กลายมาเป็นครูสอนพิเศษ ก็ยังตัดสินใจที่จะใช้แผนการหนึ่งอย่างจริงจัง ― !? ชีวิตที่จะไม่เสียใจทีหลัง ซึ่งไม่อาจก้าวข้าม ได้ด้วยสถานการณ์หื่นโดยบังเอิญนั้นคือ!?',
		cover_image:
			'https://img.fictionlog.co/ebooks/users/5bac9d30c9ca900028452570/cover-images/SITJNi79dOMh8Mcads6fnzyP.jpeg',
		price: 59.0,
		physical_price: 80,
		isbn: '9786163632036',
		published_date: '2020-05-05',
		is_active: true,
		publisher_id: '0192012a-63be-700e-a148-e66a74adee3e',
		category_id: '0192012d-055a-7557-b09c-bea0de35ee15',
		author_ids: ['0192013d-bd57-7449-83d7-cc08f601e2de'],
	},
	{
		id: '01920135-054e-7666-885e-07c5db23ab6f',
		title: 'SPY x FAMILY เล่ม 1',
		description:
			'สุดยอดสปาย <สนธยา> ได้รับคำสั่งให้สร้าง "ครอบครัว" เพื่อลอบเข้าไปในโรงเรียนชื่อดัง แต่ "ลูกสาว" ที่เขาได้พบ ดันเป็นผู้มีพลังจิตอ่านใจคน! ส่วน "ภรรยา" เป็นมือสังหาร!?\nโฮมคอเมดี้สุดฮาของครอบครัวปลอมๆ ที่ต่างฝ่ายต่างปกปิดตัวจริงของกันและกัน ที่ต้องเผชิญหน้ากับการสอบเข้าและปกป้องโลก!!',
		cover_image:
			'https://img.fictionlog.co/ebooks/users/5bac9cc0c9ca900028452532/cover-images/ViRrvbTUyyY4IkBLaOz2Qi1H.jpeg',
		price: 69,
		physical_price: null,
		isbn: '0000000000000',
		published_date: '2024-02-13',
		is_active: true,
		publisher_id: '01920137-5f47-7116-83ee-944ee0ed0c42',
		category_id: '01920131-72bc-7ffb-8114-de4bd19d6f64',
		author_ids: ['01920132-5a9e-788d-8534-5f65b7c566ce'],
	},
	{
		id: '0192013f-1744-7007-bb41-fe00b0c6a8b7',
		title: 'SPY x FAMILY เล่ม 2',
		description:
			'สุดยอดสปาย <สนธยา> ได้รับคำสั่งให้สร้าง "ครอบครัว" เพื่อลอบเข้าไปในโรงเรียนชื่อดัง แต่ "ลูกสาว" ที่เขาได้พบ ดันเป็นผู้มีพลังจิตอ่านใจคน! ส่วน "ภรรยา" เป็นมือสังหาร!?\nโฮมคอเมดี้สุดฮาของครอบครัวปลอมๆ ที่ต่างฝ่ายต่างปกปิดตัวจริงของกันและกัน ที่ต้องเผชิญหน้ากับการสอบเข้าและปกป้องโลก!!',
		cover_image:
			'https://img.fictionlog.co/ebooks/users/5bac9cc0c9ca900028452532/cover-images/Mulv8X0Tojd58tAOIYcVyDVP.jpeg',
		price: 69,
		physical_price: null,
		isbn: '0000000000000',
		published_date: '2024-02-13',
		is_active: true,
		publisher_id: '01920137-5f47-7116-83ee-944ee0ed0c42',
		category_id: '01920131-72bc-7ffb-8114-de4bd19d6f64',
		author_ids: ['01920132-5a9e-788d-8534-5f65b7c566ce'],
	},
];

async function insertAuthors() {
	const conn = await pool.getConnection();

	const stmt = `
	INSERT INTO authors
	(
		id,
		name
	)
	VALUES
	(
		?,
		?
	);
	`;

	for (const author of authors) {
		await conn.query(stmt, [author.id, author.name]);
	}

	conn.release();
}

async function insertCategories() {
	const conn = await pool.getConnection();

	const stmt = `
	INSERT INTO categories
	(
		id,
		name
	)
	VALUES
	(
		?,
		?
	);
	`;

	for (const category of categories) {
		await conn.query(stmt, [category.id, category.name]);
	}

	conn.release();
}

async function insertPublishers() {
	const conn = await pool.getConnection();

	const stmt = `
	INSERT INTO publishers
	(
		id,
		name
	)
	VALUES
	(
		?,
		?
	);
	`;

	for (const publisher of publishers) {
		await conn.query(stmt, [publisher.id, publisher.name]);
	}

	conn.release();
}

async function insertBooks() {
	const conn = await pool.getConnection();

	const stmt = `
	INSERT INTO books
	(
		id,
		title,
		description,
		isbn,
		price,
		physical_price,
		published_date,
		cover_image,
		is_active,
		publisher_id,
		category_id
	)
	VALUES
	(
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?
	);
	`;

	for (const book of books) {
		await conn.query(stmt, [
			book.id,
			book.title,
			book.description,
			book.isbn,
			book.price,
			book.physical_price,
			book.published_date,
			book.cover_image,
			book.is_active,
			book.publisher_id,
			book.category_id,
		]);
	}

	conn.release();
}

async function insertBookAuthors() {
	const conn = await pool.getConnection();

	const stmt = `
	INSERT INTO book_authors
	(
		book_id,
		author_id
	)
	VALUES
	(
		?,
		?
	);
	`;

	for (const book of books) {
		for (const author_id of book.author_ids) {
			await conn.query(stmt, [book.id, author_id]);
		}
	}

	conn.release();
}

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
	// await init();
	await insertAuthors();
	await insertCategories();
	await insertPublishers();
	await insertBooks();
	await insertBookAuthors();
	console.log('Initial data created');
}

await main();
