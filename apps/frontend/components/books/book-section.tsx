import { Button } from '@/components/ui/button';
import type { BookPublic } from '@/lib/elma/types/books';
import Link from 'next/link';

interface BookSectionProps {
	title: string;
	subtitle?: string;
	books: BookPublic[];
}

export default function BookSection({
	title,
	subtitle,
	books,
}: BookSectionProps) {
	return (
		<section className="mb-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">{title}</h2>
				{/* <Link href={'#'}></Link> */}
				<Button variant={'link'}>ดูทั่งหมด</Button>
			</div>
			{subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
			{/* {promotion && <h3 className="text-xl font-semibold mb-4">{promotion}</h3>} */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{books.map((book) => (
					<div key={book.id} className="bg-white p-4 rounded-lg shadow">
						<Link href={`/ebook/${book.id}`}>
							<img
								src={book.cover_image || ''}
								alt={book.title}
								className="w-full h-56 object-cover mb-2 rounded"
							/>
						</Link>
						<Link href={`/ebook/${book.id}`}>
							<h4 className="font-semibold text-sm mb-1 truncate">
								{book.title}
							</h4>
						</Link>
						{/* <p className="text-gray-600 text-xs mb-2">{book.author}</p> */}
						<span className="text-gray-600 text-xs mb-2">
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
						<p className="text-sm font-bold">{book.price} บาท</p>
					</div>
				))}
			</div>
			{/* <div className="text-center mt-4">
				<Button variant="outline">
					ดูทั้งหมด
					<ChevronRight className="ml-2 h-4 w-4" />
				</Button>
			</div> */}
		</section>
	);
}
