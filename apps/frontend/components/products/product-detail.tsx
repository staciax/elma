'use client';

import { Button } from '@/components/ui/button';
import { addProductToCartMe } from '@/lib/elma/actions/shopping-carts';
import type { ProductPublic } from '@/lib/elma/types';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const productAuthors = [
	{
		author_id: '1',
		author_name: 'มาโคโตะ ชินไค',
	},
];
// const productImages = [];

// function isbnHyphen(isbn: string) {
// 	return isbn.replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5');
// }

// function priceDiffPercent(paperPrice: number, ebookPrice: number) {
// 	const diff = paperPrice - ebookPrice;
// 	const diffPercent = (diff / paperPrice) * 100;
// 	if (Number.isInteger(diffPercent)) {
// 		return diffPercent;
// 	}
// 	return diffPercent.toFixed(2);
// }

type Props = {
	product: ProductPublic;
};

export default function ProductDetail({ product }: Props) {
	const handleAddToCart = async () => {
		try {
			await addProductToCartMe(product.id);
			toast.success('เพิ่มสินค้าลงตะกร้าสำเร็จ', { duration: 5000 });
		} catch (error) {
			toast.error('เพิ่มสินค้าลงตะกร้าไม่สำเร็จ', { duration: 5000 });
		}
	};

	return (
		<section className="flex w-full max-w-6xl flex-col items-center gap-14 px-4 pt-10 pb-12 md:flex-row md:items-start">
			<div className="-z-10 top-8 w-2/4 md:sticky">
				<div className="rounded-md bg-gradient-to-b from-[rgba(120,240,132,0.2)] to-transparent">
					<div className="relative">
						<img
							src="https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif?4"
							alt="product-image"
							className="mx-auto"
						/>
					</div>
					{/* <div>test</div> */}
				</div>
			</div>
			<div className="flex w-full flex-col md:w-2/4">
				<div>
					<h3 className="font-semibold text-[#414141]">product.category_name</h3>
					<h3 className="mt-4 font-semibold text-2xl">product.product_title</h3>
					<h3 className="mt-4">
						โดย{' '}
						<span className="font-semibold text-green-500">
							{/* {productAuthors.map((author) => (
									<Link key={author.author_id} href={'#'}>
										{author.author_name}
									</Link>
								))} */}
							{/* TODO: how to join tag a */}
							{productAuthors.map((author) => author.author_name).join(', ')}
						</span>
					</h3>
					<h3 className="mt-4">
						<span className="mr-4 font-semibold text-2xl text-red-500">{product.price} บาท</span>
					</h3>
				</div>
				<hr className="my-8" />
				<div className="flex justify-between gap-8">
					<Button variant={'secondary'} className="w-full rounded-full ">
						<span className="font-light text-base">ทดลองอ่าน</span>
					</Button>
					<Button className="w-full rounded-full" onClick={handleAddToCart}>
						<ShoppingCart />
						<span className="ml-2 font-light text-base">เพิ่มลงตะกร้า</span>
					</Button>
				</div>
				<hr className="my-8" />
				<div>
					<h3 className="font-ligh text-[#707070]">เรื่องย่อ</h3>
					<h3 className="mt-2 font-light text-[#707070]">{product.description}</h3>
				</div>
				<hr className="my-8" />
				<div className="mt-4 flex">
					<div className="w-2/4">
						<h3 className="font-ligh text-[#707070]">สำนักพิมพ์</h3>
						<h3 className="font-light">product.publisher_name</h3>
						{/* TODO: link to publisher */}
					</div>

					<div className="w-2/4">
						<h3 className="font-light text-[#707070]">ประเภทไฟล์</h3>
						<h3 className="font-light">PDF</h3>
					</div>
				</div>
				<div className="mt-4 flex">
					<div className="w-2/4">
						<h3 className="font-light text-[#707070]">วันที่จำหน่าย</h3>
						<h3 className="font-light">{product.published_date}</h3>
						{/* TODO: show context datetime */}
					</div>
					<div className="w-2/4">
						<h3 className="font-light text-[#707070]">ISBN</h3>
						<h3 className="font-light">{product.isbn}</h3>
						{/* TODO: context copy and copy without hyphen */}
					</div>
				</div>
				<div className="mt-4 flex">
					<div className="w-2/4">
						<h3 className="font-light text-[#707070]">ความยาว</h3>
						<h3 className="font-light">295 หน้า</h3>
					</div>
					<div className="w-2/4">
						<h3 className="font-light text-[#707070]">ราคาหน้าปก</h3>
						<h3 className="font-light">
							{product.physical_price ? <>{product.physical_price} บาท</> : '-'}
							{/* {product.price} บาท (ประหยัด{' '}
							{priceDiffPercent(product.price, product.product_ebook_price)}%) */}
						</h3>
					</div>
				</div>
			</div>
		</section>
	);
}
