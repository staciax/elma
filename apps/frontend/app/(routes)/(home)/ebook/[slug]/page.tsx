import BookDetail from '@/components/books/book-detail';
import { getBook } from '@/lib/elma/actions/books';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// TODO: use decimal.js for price calculation
// https://github.com/MikeMcl/decimal.js
// TODO: add skeleton loading https://ui.shadcn.com/docs/components/skeleton

// TODO: remove duplicate code

// export async function generateMetadata({ params }: Props) {
// 	const slug = params.slug;

// 	const results = await getBook(slug);
// 	if (!results) {
// 		return null;
// 	}
// 	const product = results[0];

// 	return {
// 		title: product.title,
// 	};
// }

type Props = {
	params: { slug: string };
};

export default async function Page({ params }: Props) {
	const slug = params.slug;

	const book = await getBook(slug);
	if (!book) {
		return notFound();
	}

	return (
		<main className="container flex flex-col items-center">
			<Suspense fallback={<div>Loading...</div>}>
				<BookDetail book={book} />
			</Suspense>
			{/* <section>TEST</section> */}
		</main>
	);
}
