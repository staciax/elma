import { Button } from '@/components/ui/button';

interface Book {
	id: string;
	title: string;
	author: string;
	cover_image: string;
	price: number;
}

const books: Book[] = [
	{
		id: '1',
		title: 'Little Mermaid แห่งท้องทะเลสีฟ้า',
		author: 'Author 1',
		cover_image: 'https://ui.shadcn.com/placeholder.svg?height=200&width=150',
		price: 250,
	},
	{
		id: '2',
		title: 'SHINSUI',
		author: 'Author 2',
		cover_image: 'https://ui.shadcn.com/placeholder.svg?height=200&width=150',
		price: 180,
	},
	{
		id: '3',
		title: 'วันไหนที่คุณหายไป',
		author: 'Author 3',
		cover_image: 'https://ui.shadcn.com/placeholder.svg?height=200&width=150',
		price: 200,
	},
	{
		id: '4',
		title: 'บัตรเครดิต',
		author: 'Author 4',
		cover_image: 'https://ui.shadcn.com/placeholder.svg?height=200&width=150',
		price: 150,
	},
	{
		id: '5',
		title: 'ฟุตบอลโลก',
		author: 'Author 5',
		cover_image: 'https://ui.shadcn.com/placeholder.svg?height=200&width=150',
		price: 220,
	},
	{
		id: '6',
		title: 'Book 6',
		author: 'Author 6',
		cover_image: 'https://ui.shadcn.com/placeholder.svg?height=200&width=150',
		price: 190,
	},
];

interface BookSectionProps {
	title: string;
	subtitle?: string;
}

export default function BookSection({ title, subtitle }: BookSectionProps) {
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
						<img
							src={book.cover_image}
							alt={book.title}
							className="w-full h-48 object-cover mb-2 rounded"
						/>
						<h4 className="font-semibold text-sm mb-1 truncate">
							{book.title}
						</h4>
						<p className="text-gray-600 text-xs mb-2">{book.author}</p>
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
