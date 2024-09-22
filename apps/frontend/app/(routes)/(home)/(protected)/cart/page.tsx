import { Button } from '@/components/ui/button';
import { getShoppingCartMe } from '@/lib/elma/actions/shopping-carts';

import { Trash } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'ตะกร้าสินค้า',
};

// export const fetchCache = 'force-no-store';

export default async function Page() {
	const results = await getShoppingCartMe();

	// TODO: use decimal.js for price calculation
	// TODO: remove hardcode
	const total = 666.5;
	const shippingCost = 60;
	const grandTotal = total + shippingCost;

	return (
		<section className="container">
			<div>
				<div className="flex flex-row items-start">
					<main className="w-full">
						<h2 className="text-3xl">ตะกร้าของคุณ</h2>
						<div className="flex flex-col">
							{results.map((book) => (
								<div key={book.id} className="flex max-w-xl border-b pb-6">
									<div className="min-w-48 max-w-48 p-4">
										<Link href={`/ebook/${book.id}`}>
											<img
												src={
													book.cover_image ||
													'https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif'
												}
												alt="Book Cover"
												width={400}
												height={600}
												className="aspect-[2/3] w-full object-cover transition-opacity group-hover:opacity-80 "
											/>
										</Link>
									</div>
									<div className="flex w-full justify-between">
										<div className="flex flex-col">
											<h2 className="text-sm">{book.category?.name}</h2>
											<Link href={`/ebook/${book.id}`} className="mt-2">
												{book.title}
											</Link>
											<h2 className="mt-2">โดย ยาเอะ อุทสึมิ</h2>
										</div>
										<div className="flex flex-col items-end">
											<span>{book.price} บาท</span>
											<Link href="#">
												<Trash className="h-4 w-4 text-red-500" />
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					</main>
					<aside className="sticky w-full max-w-[22rem] rounded-md border p-6 ">
						<div>
							<h2 className="text-2xl">ยอดคำสั่งซื้อ</h2>
							<div>
								<div>
									<div>
										<div className="flex justify-between">
											<span>รวม</span>
											<span>{total} บาท</span>
										</div>
										<div className="flex justify-between">
											<span>ค่าจัดส่ง</span>
											<span>{shippingCost} บาท</span>
										</div>
									</div>
									<div>
										<div className="flex justify-between">
											<span>ยอดชำระ</span>
											<span>
												<span>{grandTotal}</span> บาท
											</span>
										</div>
									</div>
									<div>
										<Button>ดำเนินการชำระเงิน</Button>
									</div>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</section>
	);
}
