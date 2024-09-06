import SignInForm from '@/components/forms/sign-in';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'เข้าสู่ระบบ',
};

export function LoginForm() {
	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
				<CardDescription>Enter your email below to login to your account</CardDescription>
			</CardHeader>
			<CardContent>
				<SignInForm />
			</CardContent>
		</Card>
	);
}

async function Page() {
	return (
		<main className="container flex ">
			<LoginForm />
		</main>
	);
}

export default Page;
