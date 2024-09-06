import SignInForm from '@/components/forms/sign-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Metadata } from 'next';
import Link from 'next/link';

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
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">อีเมล</Label>
						<Input id="email" type="email" placeholder="m@example.com" required />
					</div>
					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">รหัสผ่าน</Label>
							<Link href="#" className="ml-auto inline-block text-sm underline transition-colors hover:text-[#5AB772]">
								ลืมรหัสผ่าน?
							</Link>
						</div>
						<Input id="password" type="password" required />
					</div>
					<Button type="submit" className="w-full transition hover:bg-[#5AB772]">
						เข้าสู่ระบบ
					</Button>
					<Button variant="outline" className="w-full transition hover:bg-[#5AB772] hover:text-white">
						เข้าสู่ระบบด้วย Google
					</Button>
				</div>
				<div className="mt-4 text-center text-sm">
					ยังไม่มีบัญชีใช่ไหม?{' '}
					<Link href="/register" className="text-[#5AB772] underline">
						สมัครสมาชิก
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

async function Page() {
	return (
		<main className="container flex ">
			<LoginForm />
			{/* <SignInForm /> */}
			{/* <Button>Sign in</Button> */}
		</main>
	);
}

export default Page;
