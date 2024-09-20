import ProductDetail from '@/components/books/product-detail';
import { getBook } from '@/lib/elma/actions/books';
import { notFound } from 'next/navigation';

// TODO: use decimal.js for price calculation
// https://github.com/MikeMcl/decimal.js
// TODO: add skeleton loading https://ui.shadcn.com/docs/components/skeleton

// TODO: remove duplicate code

// export async function generateMetadata({ params }: Props) {
// 	const slug = params.slug;

// 	const results = await getProduct(slug);
// 	if (!results.length) {
// 		return <div>Product not found</div>;
// 	}
// 	const product = results[0];

// 	return {
// 		title: product.product_title,
// 	};
// }

type Props = {
	params: { slug: string };
};

export default async function Page({ params }: Props) {
	const slug = params.slug;

	const results = await getBook(slug);
	if (!results) {
		return notFound();
	}
	const product = results[0];

	return (
		<main className="container flex flex-col items-center">
			<ProductDetail product={product} />
			<section>TEST</section>
		</main>
	);
}
