import { BookCard } from '@/components/books/book-card';
import { getBooks } from '@/lib/elma/actions/books';

export default async function Home() {
	const results = await getBooks();
	const books = results.data;
	return (
		<main>
			<section className="container">
				<div className="flex flex-row flex-wrap justify-center gap-4">
					{books.map((book) => (
						<BookCard
							key={book.id}
							book={book}
							className="w-[calc(20%_-_30px)]"
						/>
					))}
				</div>
			</section>
		</main>
	);
}
