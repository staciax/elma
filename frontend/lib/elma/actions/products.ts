'use server';
import axios from '@/lib/axios';

type Product = {
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

export const getProduct = async (id: string): Promise<Product[]> => {
	console.log('product id:', id);
	try {
		const response = await axios.get(`/v1/products/${id}/`);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
