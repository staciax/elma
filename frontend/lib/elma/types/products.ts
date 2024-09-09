export type ProductPublic = {
	product_id: string;
	product_title: string;
	product_description: string;
	product_isbn: string;
	product_ebook_price: number;
	product_paper_price: number;
	// product_ebook_file: string;
	published_date: string;
	publisher_id?: string;
	publisher_name?: string;
	category_id?: string;
	category_name?: string;
};

export type ProductsPublic = {
	count: number;
	data: ProductPublic[];
};
