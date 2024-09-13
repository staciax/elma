import { getProducts } from '@/lib/elma/actions/products';

import { ProductCard } from '@/components/products/product-card';

export default async function Home() {
	const results = await getProducts();
	const products = results.data;
	return (
		<main>
			<section className="container">
				{/* <div className="grid grid-cols-2 gap-4 md:grid-cols-5"> */}
				<div className="flex flex-row flex-wrap justify-center gap-4">
					{products.map((product) => (
						<ProductCard key={product.id} product={product} className="w-[calc(20%_-_30px)]" />
					))}
				</div>
			</section>
		</main>
	);
}
