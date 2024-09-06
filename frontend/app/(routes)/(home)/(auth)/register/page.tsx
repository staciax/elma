import SignUpForm from '@/components/forms/sign-up';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'สมัครสมาชิก',
};

export function RegisterForm() {
	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-xl">สมัครสมาชิก</CardTitle>
				<CardDescription>Enter your information to create an account</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="first-name">ชื่อ</Label>
							<Input id="first-name" placeholder="Max" required />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="last-name">นามสกุล</Label>
							<Input id="last-name" placeholder="Robinson" required />
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="email">อีเมล</Label>
						<Input id="email" type="email" placeholder="m@example.com" required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">รหััสผ่าน</Label>
						<Input id="password" type="password" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password-comfirm">ยืนยันรหัสผ่าน</Label>
						<Input
							id="password-comfirm"
							type="password"
							className="focus:border-[#5AB772] focus:outline-[#5AB772] focus:ring-[#5AB772]"
						/>
					</div>
					<Button type="submit" className="w-full transition hover:bg-[#5AB772]">
						สมัครสมาชิก
					</Button>
					{/* <Button variant="outline" className="w-full">
						Sign up with GitHub
					</Button> */}
				</div>
				<div className="mt-4 text-center text-sm">
					หากมีบัญชีผู้ใช้แล้ว?{' '}
					<Link href="/login" className="text-[#5AB772] underline">
						เข้าสู่ระบบ
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

function Page() {
	return (
		<main className="container flex ">
			{/* <SignUpForm /> */}
			<RegisterForm />
		</main>
	);
}

export default Page;
