import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ProductPublic } from '@/lib/elma/types';
import Link from 'next/link';

type Props = {
	className?: string;
	product: ProductPublic;
};

export function ProductCard({ product, className }: Props) {
	return (
		// <Card className={cn('w-full overflow-hidden', className || 'max-w-52')}>
		// 	<div className="group relative">
		// 		<img
		// 			src="https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif"
		// 			alt="Book Cover"
		// 			width={400}
		// 			height={600}
		// 			className="aspect-[2/3] w-full object-cover transition-opacity group-hover:opacity-80"
		// 		/>
		// 		<Link href={`/product/${product.product_id}`}>
		// 			<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/80 to-transparent p-6">
		// 				<h3 className="line-clamp-2 font-semibold text-black text-lg">{product.product_title}</h3>
		// 			</div>
		// 		</Link>
		// 	</div>
		// 	<div className="flex items-center justify-between gap-4 border-muted/20 border-t p-4">
		// 		<div className="font-bold text-primary">{product.product_ebook_price} บาท</div>
		// 		<Button className="text-xs">เพิ่มลงตะกร้า</Button>
		// 	</div>
		// </Card>
		// {cn('w-full max-w-xs rounded-md border', className || 'max-w-56')}
		<Card className="w-full max-w-52 rounded-md border">
			<div className="group flex h-full flex-col justify-between">
				<div className="aspect-[2/3] w-full overflow-hidden rounded-md">
					<Link href={`/product/${product.id}`}>
						<img
							src="https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif"
							alt="Book Cover"
							width={400}
							height={600}
							className="aspect-[2/3] w-full border object-cover transition-opacity group-hover:opacity-80"
						/>
					</Link>
				</div>
				<div className="mb-auto px-2 pt-2">
					<Link href={`/product/${product.id}`} className="line-clamp-2 font-normal text-sm md:text-base">
						{product.title}
					</Link>
				</div>
				<div className="grid gap-2 px-2 pb-2">
					<p className="font-semibold text-sm md:text-base">{product.price} บาท</p>
					<Button size="sm" className="mt-auto">
						เพิ่มลงตะกร้า
					</Button>
				</div>
			</div>
		</Card>
	);
}
