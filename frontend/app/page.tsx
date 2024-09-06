import { getProducts } from '@/lib/elma/actions/products';
import Link from 'next/link';

export default async function Home() {
	const results = await getProducts();
	const products = results.data;
	return (
		<main>
			{products.map((product) => (
				<div key={product.product_id}>
					<Link href={`/product/${product.product_id}`}>
						<h2>{product.product_title}</h2>
					</Link>
				</div>
			))}
		</main>
	);
}
