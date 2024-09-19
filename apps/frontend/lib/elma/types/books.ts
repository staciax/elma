import type { AuthorPublic } from './authors';
import type { CategoryPublic } from './categories';
import type { PublisherPublic } from './publishers';

export type BookPublic = {
	id: string;
	title: string;
	description: string;
	isbn: string;
	price: number;
	physical_price: number;
	published_date: string;
	cover_image: string | null;
	is_active: boolean;
	category: CategoryPublic | null;
	publisher: PublisherPublic | null;
	authors: AuthorPublic[] | null;
};

export type BooksPublic = {
	count: number;
	data: BookPublic[];
};
