'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addBookToCartMe } from '@/lib/elma/actions/shopping-carts';
import type { BookPublic } from '@/lib/elma/types';
import { type AxiosError, isAxiosError } from 'axios';
import { format, formatRelative, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { BookOpen, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

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
	book: BookPublic;
};

export default function BookDetail({ book }: Props) {
	const { toast } = useToast();

	const [isWishlisted, setIsWishlisted] = useState(false);
	// const [addingToCart, setAddingToCart] = useState(false);

	const handleToggleWishlist = () => {
		// console.log(
		// 	isWishlisted ? 'Removed from wishlist:' : 'Added to wishlist:',
		// 	book.title,
		// );
		setIsWishlisted(!isWishlisted);
		toast({
			description: isWishlisted ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด',
			duration: 4000,
		});
	};

	const handleAddToCart = async () => {
		// setAddingToCart(true);
		// await new Promise((resolve) => setTimeout(resolve, 300));
		const { error } = await addBookToCartMe(book.id);
		if (error) {
			toast({
				description: 'คุณมีหนังสือนี้อยู่ในตะกร้าแล้ว',
				duration: 4000,
			});
		} else {
			toast({ description: 'เพิ่มสินค้าลงตะกร้าสำเร็จ', duration: 4000 });
		}
		// setAddingToCart(false);

		// try {
		// 	await addBookToCartMe(book.id);
		// 	toast({
		// 		title: 'เพิ่มสินค้าลงตะกร้าสำเร็จ',
		// 		variant: 'default',
		// 		duration: 5000,
		// 	});
		// 	toast({});
		// } catch (error) {
		// 	const { message } = error as Error;
		// 	console.log(isAxiosError(error));
		// 	toast({
		// 		title: 'เพิ่มสินค้าลงตะกร้าไม่สำเร็จ',
		// 		description: message,
		// 		variant: 'destructive',
		// 		duration: 5000,
		// 	}); // clear toast
		// 	// toast.error('เพิ่มสินค้าลงตะกร้าไม่สำเร็จ', { duration: 5000 });
		// }
	};

	const handleSampleRead = () => {
		console.log('Opening sample read for:', book.title);
	};

	return (
		<section className="flex w-full max-w-6xl flex-col items-center gap-14 px-4 pt-10 pb-12 md:flex-row md:items-start">
			<div className="-z-10 top-8 w-2/4 md:sticky">
				<div className="rounded-md bg-gradient-to-b from-[rgba(120,240,132,0.2)] to-transparent">
					<div className="relative">
						<img
							src={
								book.cover_image ||
								'https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif?4'
							}
							alt="product-image"
							className="mx-auto"
						/>
					</div>
					{/* <div>test</div> */}
				</div>
			</div>
			<div className="flex w-full flex-col md:w-2/4">
				<div>
					<h3 className="font-semibold text-[#414141]">
						{book.category ? book.category.name : ''}
					</h3>
					<h3 className="mt-4 font-semibold text-2xl">{book.title}</h3>
					<h3 className="mt-4">
						โดย{' '}
						<span className="font-semibold text-green-500">
							{/* {productAuthors.map((author) => (
									<Link key={author.author_id} href={'#'}>
										{author.author_name}
									</Link>
								))} */}
							{/* TODO: how to join tag a */}
							{book.authors
								? book.authors.map((author) => author.name).join(', ')
								: ''}
						</span>
					</h3>
					<h3 className="mt-4">
						<span className="mr-4 font-semibold text-2xl text-red-500">
							{book.price} บาท
						</span>
					</h3>
				</div>
				<hr className="my-8" />
				<div className="flex justify-between gap-4">
					{/* <Button variant={'secondary'} className="w-full rounded-full ">
						<span className="font-light text-base">ทดลองอ่าน</span>
					</Button> */}
					<Button
						variant="outline"
						onClick={handleSampleRead}
						className="flex-1"
					>
						<BookOpen className="mr-2 h-4 w-4" /> ทดลองอ่าน
					</Button>
					{/* <Button className="w-full rounded-full" onClick={handleAddToCart}>
						<ShoppingCart />
						<span className="ml-2 font-light text-base">เพิ่มลงตะกร้า</span>
					</Button> */}
					<Button
						onClick={handleAddToCart}
						className="flex-1"
						// disabled={addingToCart}
					>
						<ShoppingCart className="mr-2 h-4 w-4" /> เพิ่มลงตะกร้า
					</Button>
					<Button
						variant={isWishlisted ? 'secondary' : 'outline'}
						onClick={handleToggleWishlist}
						className="w-10 h-10 p-0"
						aria-label={isWishlisted ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
					>
						<Heart
							className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`}
						/>
					</Button>
				</div>
				<hr className="my-8" />
				<div>
					<h3 className="font-ligh text-[#707070]">เรื่องย่อ</h3>
					<h3 className="mt-2 font-light text-[#707070]">{book.description}</h3>
				</div>
				<hr className="my-8" />
				<div className="mt-4 flex">
					<div className="w-2/4">
						<h3 className="font-ligh text-[#707070]">สำนักพิมพ์</h3>
						<h3 className="font-light">
							{book.publisher ? book.publisher.name : ''}
						</h3>
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
						<h3 className="font-light">
							{format(book.published_date, 'PPP', {
								locale: th,
							})}
						</h3>
						{/* TODO: show context datetime */}
					</div>
					<div className="w-2/4">
						<h3 className="font-light text-[#707070]">ISBN</h3>
						<h3 className="font-light">{book.isbn}</h3>
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
							{book.physical_price ? <>{book.physical_price} บาท</> : '-'}
							{/* {product.price} บาท (ประหยัด{' '}
							{priceDiffPercent(product.price, product.product_ebook_price)}%) */}
						</h3>
					</div>
				</div>
			</div>
		</section>
	);
}
