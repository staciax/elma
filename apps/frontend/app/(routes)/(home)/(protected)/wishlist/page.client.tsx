'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BooksPublic } from '@/lib/elma/types/books';
import { ChevronLeft, MoreVertical, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

type Props = {
	initialData: BooksPublic;
};

export default function BookWishlistClient({ initialData }: Props) {
	const [data, _setData] = useState<BooksPublic>(initialData);

	return (
		<main className="max-w-7xl mx-auto p-4">
			<div className="flex items-center mb-4">
				<ChevronLeft className="w-6 h-6" />
				<h1 className="text-2xl font-bold ml-2">สิ่งที่อยากอ่าน</h1>
			</div>

			<div className="px-4 py-6 sm:px-0">
				{/* <div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-semibold text-gray-900">สิ่งที่อยากอ่าน</h1>
				</div> */}
				<div className="space-y-6">
					{data.data.map((book) => (
						<div
							key={book.id}
							className="bg-white shadow overflow-hidden sm:rounded-lg"
						>
							<div className="px-4 py-5 sm:px-6 flex items-start">
								<div className="flex-shrink-0 mr-4">
									<img
										src={
											book.cover_image || '/placeholder.svg?height=120&width=80'
										}
										alt={book.title}
										className="w-20 h-30 object-cover"
									/>
								</div>
								<div className="flex-1">
									<h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
										{book.title}
										{/* {book.isNew && (
											<span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
												ใหม่
											</span>
										)} */}
									</h3>
									<p className="text-sm text-gray-600">
										{book.authors
											? book.authors.map((author) => author.name).join(', ')
											: ''}
									</p>
									<p className="mt-1 text-sm font-semibold text-gray-900">
										{book.price} บาท
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<Button variant="outline" size="sm">
										<ShoppingCart className="h-4 w-4 mr-2" />
										เพิ่มลงตะกร้า
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>ลบออกจากสิ่งที่อยากอ่าน</DropdownMenuItem>
											<DropdownMenuItem>ดูรายละเอียด</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
