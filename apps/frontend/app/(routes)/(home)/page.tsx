import BookCarousel from '@/components/books/book-carousel';
import BookSection from '@/components/books/book-section';
// import { getBooks } from '@/lib/elma/actions/books';

export default async function Home() {
	// const results = await getBooks();
	// const books = results.data;
	return (
		<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
			<BookCarousel />
			<BookSection title="ร้านหนังขายดี" subtitle="หนังสือที่ขายดีที่สุดในร้าน" />
			<BookSection title="หนังสือยอดนิยม" />
			<BookSection title="หนังสือมาใหม่" />
		</main>
	);
}
