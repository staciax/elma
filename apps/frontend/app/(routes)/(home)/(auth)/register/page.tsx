import SignUpForm from '@/components/forms/sign-up';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'สมัครสมาชิก',
};

export function RegisterForm() {
	return (
		<Card className="mx-auto w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-xl">สมัครสมาชิก</CardTitle>
				<CardDescription>กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ของคุณ</CardDescription>
			</CardHeader>
			<CardContent>
				<SignUpForm />
			</CardContent>
		</Card>
	);
}

function Page() {
	return (
		<main className="container flex h-[80vh] items-center justify-center">
			{/* <SignUpForm /> */}
			<RegisterForm />
		</main>
	);
}

export default Page;
