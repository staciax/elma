// import { Button } from '@/components/ui/button';
// import { getShoppingCartMe } from '@/lib/elma/actions/shopping-carts';

// import { Trash } from 'lucide-react';
// import type { Metadata } from 'next';
// import Link from 'next/link';

// export const metadata: Metadata = {
// 	title: 'ตะกร้าสินค้า',
// };

// // export const fetchCache = 'force-no-store';

// export default async function Page() {
// 	const results = await getShoppingCartMe();

// 	// TODO: use decimal.js for price calculation
// 	// TODO: remove hardcode
// 	const total = 666.5;
// 	const shippingCost = 60;
// 	const grandTotal = total + shippingCost;

// 	return (
// 		<section className="container">
// 			<div>
// 				<div className="flex flex-row items-start">
// 					<main className="w-full">
// 						<h2 className="text-3xl">ตะกร้าของคุณ</h2>
// 						<div className="flex flex-col">
// 							{results.map((book) => (
// 								<div key={book.id} className="flex max-w-xl border-b pb-6">
// 									<div className="min-w-48 max-w-48 p-4">
// 										<Link href={`/ebook/${book.id}`}>
// 											<img
// 												src={
// 													book.cover_image ||
// 													'https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif'
// 												}
// 												alt="Book Cover"
// 												width={400}
// 												height={600}
// 												className="aspect-[2/3] w-full object-cover transition-opacity group-hover:opacity-80 "
// 											/>
// 										</Link>
// 									</div>
// 									<div className="flex w-full justify-between">
// 										<div className="flex flex-col">
// 											<h2 className="text-sm">{book.category?.name}</h2>
// 											<Link href={`/ebook/${book.id}`} className="mt-2">
// 												{book.title}
// 											</Link>
// 											<h2 className="mt-2">โดย ยาเอะ อุทสึมิ</h2>
// 										</div>
// 										<div className="flex flex-col items-end">
// 											<span>{book.price} บาท</span>
// 											<Link href="#">
// 												<Trash className="h-4 w-4 text-red-500" />
// 											</Link>
// 										</div>
// 									</div>
// 								</div>
// 							))}
// 						</div>
// 					</main>
// 					<aside className="sticky w-full max-w-[22rem] rounded-md border p-6 ">
// 						<div>
// 							<h2 className="text-2xl">ยอดคำสั่งซื้อ</h2>
// 							<div>
// 								<div>
// 									<div>
// 										<div className="flex justify-between">
// 											<span>รวม</span>
// 											<span>{total} บาท</span>
// 										</div>
// 										<div className="flex justify-between">
// 											<span>ค่าจัดส่ง</span>
// 											<span>{shippingCost} บาท</span>
// 										</div>
// 									</div>
// 									<div>
// 										<div className="flex justify-between">
// 											<span>ยอดชำระ</span>
// 											<span>
// 												<span>{grandTotal}</span> บาท
// 											</span>
// 										</div>
// 									</div>
// 									<div>
// 										<Button>ดำเนินการชำระเงิน</Button>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</aside>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { getShoppingCartMe } from '@/lib/elma/actions/shopping-carts';
import type { BookPublic } from '@/lib/elma/types';
import {
	Bell,
	Book,
	ChevronLeft,
	Heart,
	MoreHorizontal,
	MoreVertical,
	ShoppingCart,
	User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
	// const results = await getShoppingCartMe();

	const [cartItems, setCartItems] = useState<BookPublic[]>([]);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const results = await getShoppingCartMe();
			setCartItems(results);
		};
		fetchData();
	}, []);

	const toggleSelectAll = () => {
		if (selectedItems.length === cartItems.length) {
			setSelectedItems([]);
		} else {
			setSelectedItems(cartItems.map((item) => item.id));
		}
	};

	const toggleSelectItem = (id: string) => {
		if (selectedItems.includes(id)) {
			setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	};

	const totalPrice = selectedItems.reduce((sum, id) => {
		const item = cartItems.find((item) => item.id === id);
		const priceNumber = Number.parseFloat(item?.price || '0');
		return sum + priceNumber;
	}, 0);

	return (
		<div className="max-w-7xl mx-auto p-4">
			<div className="flex items-center mb-4">
				<ChevronLeft className="w-6 h-6" />
				<h1 className="text-2xl font-bold ml-2">ตะกร้าหนังสือ</h1>
			</div>

			<div className="flex flex-col md:flex-row gap-6">
				<div className="flex-grow">
					<div className="flex items-center mb-4">
						<Checkbox
							id="selectAll"
							checked={selectedItems.length === cartItems.length}
							onCheckedChange={toggleSelectAll}
						/>
						<Label htmlFor="selectAll" className="ml-2">
							เลือกทั้งหมด
						</Label>
						<Button variant="ghost" className="ml-auto">
							ลบ
						</Button>
					</div>

					{cartItems.map((item) => (
						<div key={item.id} className="flex items-center border-b py-4">
							<Checkbox
								checked={selectedItems.includes(item.id)}
								onCheckedChange={() => toggleSelectItem(item.id)}
							/>
							<img
								src={
									item.cover_image ||
									'https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif'
								}
								alt={item.title}
								className="w-20 h-24 object-cover ml-4"
							/>
							<div className="ml-4 flex-grow">
								<h3 className="font-semibold">{item.title}</h3>
								<p className="text-sm text-gray-600">
									{item.authors
										? item.authors.map((author) => author.name).join(', ')
										: ''}
								</p>
								<p className="font-bold mt-2">{item.price} บาท</p>
							</div>
							<Button variant="ghost" size="icon">
								<Heart className="w-5 h-5" />
							</Button>
							<Button variant="ghost" size="icon">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button aria-haspopup="true" size="icon" variant="ghost">
											{/* <MoreHorizontal className="h-4 w-4" /> */}
											<MoreVertical className="w-5 h-5" />
											<span className="sr-only">Toggle menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>ลบ</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</Button>
						</div>
					))}
				</div>

				<div className="md:max-w-[18.75rem] w-full">
					<div className=" p-4 rounded-lg sticky top-4">
						{/* <h2 className="font-bold text-lg mb-4">สรุปรายการ</h2> */}
						<div className="flex justify-between mb-2">
							<span>จำนวนทั้งหมด</span>
							<span>{selectedItems.length} เล่ม</span>
						</div>
						<div className="flex justify-between font-bold">
							<span>ราคาสุทธิ</span>
							<span>{totalPrice.toFixed(2)} บาท</span>
						</div>

						<Select>
							<SelectTrigger className="w-full mt-4">
								<SelectValue placeholder="เลือกช่องทางชำระเงิน" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="promptpay">พร้อมเพย์</SelectItem>
								<SelectItem value="credit">บัตรเครดิต</SelectItem>
								<SelectItem value="bank">โอนเงินผ่านธนาคาร</SelectItem>
							</SelectContent>
						</Select>

						<Button className="w-full mt-4">ชำระเงิน</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
