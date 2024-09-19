import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import '../styles/globals.css';
import { getUserMe } from '@/lib/elma/actions/users';
import { UserProvider } from '@/lib/elma/auth';

const prompt = Prompt({
	subsets: ['thai'],
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
	display: 'auto',
});

export const metadata: Metadata = {
	title: 'ELMA',
	description: 'ELMA is a book store.',
};

// TODO: cart provider

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const userPromise = getUserMe();
	return (
		<html lang="en">
			<body className={prompt.className}>
				<UserProvider userPromise={userPromise}>{children}</UserProvider>
				<Toaster />
			</body>
		</html>
	);
}
