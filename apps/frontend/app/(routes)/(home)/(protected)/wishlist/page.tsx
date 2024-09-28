import { getBooks } from '@/lib/elma/actions/books';
import type { Metadata } from 'next/types';
import { Suspense } from 'react';
import BookWishlistClient from './page.client';

export const metadata: Metadata = {
	title: 'อีบุ๊คที่อยากอ่าน',
};

export default async function Page() {
	const results = await getBooks();
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<BookWishlistClient initialData={results} />
		</Suspense>
	);
}
