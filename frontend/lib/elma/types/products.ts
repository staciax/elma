import type { AuthorPublic } from './authors';
import type { CategoryPublic } from './categories';
import type { PublisherPublic } from './publishers';

export type ProductPublic = {
	id: string;
	title: string;
	description: string;
	isbn: string;
	price: number;
	physical_price: number;
	published_date: string;
	category: CategoryPublic | null;
	publisher: PublisherPublic | null;
	authors: AuthorPublic[] | null;
};

export type ProductsPublic = {
	count: number;
	data: ProductPublic[];
};
