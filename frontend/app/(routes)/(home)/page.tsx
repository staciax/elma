import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getProducts } from '@/lib/elma/actions/products';
import type { Product } from '@/lib/elma/types';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type Props = {
	className?: string;
	product: Product;
};

function ProductCard({ product, className }: Props) {
	return (
		<Card className={cn('w-full overflow-hidden', className || 'max-w-52')}>
			<div className="group relative">
				<img
					src="https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif"
					alt="Book Cover"
					width={400}
					height={600}
					className="aspect-[2/3] w-full object-cover transition-opacity group-hover:opacity-80"
				/>
				<Link href={`/product/${product.product_id}`}>
					<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/80 to-transparent p-6">
						<h3 className="line-clamp-2 font-semibold text-black text-lg">{product.product_title}</h3>
					</div>
				</Link>
			</div>
			<div className="flex items-center justify-between gap-4 border-muted/20 border-t p-4">
				<div className="font-bold text-primary">{product.product_ebook_price} บาท</div>
				<Button className="text-xs">เพิ่มลงตะกร้า</Button>
			</div>
		</Card>
	);
}

export default async function Home() {
	const results = await getProducts();
	const products = results.data;
	return (
		<main>
			<section className="container">
				<div className="flex flex-row flex-wrap justify-center gap-4">
					{products.map((product) => (
						<ProductCard key={product.product_id} product={product} className=" w-[calc(20%_-_30px)]" />
					))}
				</div>
			</section>
		</main>
	);
}
