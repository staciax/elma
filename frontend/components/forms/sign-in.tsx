'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/elma/actions/sign-in';
import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
	email: z.string().email(),
	password: z
		.string()
		// .min(8, {
		// 	message: 'min length is 8',
		// })
		.max(255, {
			message: 'max length is 255',
		}),
});

// TODO: implement next path after login

function SignInForm() {
	type Schema = z.infer<typeof schema>;
	const {
		register,
		handleSubmit,
		formState: { errors },
		// reset,
	} = useForm<Schema>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	async function onSubmit(values: Schema) {
		const { access_token } = await signIn(values.email, values.password);
		setCookie('ac-token', access_token, {
			// httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			// maxAge: 60 * 60 * 24 * 7, // 1 week
		});
		if (access_token) {
			// reset();
			// router.push('/');
		}
	}

	// TODO: use Form component from shadcn/ui instead of form

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="email">อีเมล</Label>
					<Input
						{...register('email', { required: true })}
						id="email"
						type="email"
						placeholder="m@example.com"
						required
					/>
					{errors.email && <span role="alert">{errors.email.message}</span>}
				</div>
				<div className="grid gap-2">
					<div className="flex items-center">
						<Label htmlFor="password">รหัสผ่าน</Label>
						<Link href="#" className="ml-auto inline-block text-sm underline transition-colors hover:text-[#5AB772]">
							ลืมรหัสผ่าน?
						</Link>
					</div>
					<Input
						{...register('password', { required: true })}
						id="password"
						type="password"
						minLength={0}
						maxLength={255}
						required
					/>
					{errors.password && <span role="alert">{errors.password.message}</span>}
				</div>
				<Button type="submit" className="w-full transition hover:bg-[#5AB772]">
					เข้าสู่ระบบ
				</Button>
				{/* <Button variant="outline" className="w-full transition hover:bg-[#5AB772] hover:text-white">
					เข้าสู่ระบบด้วย Google
				</Button> */}
			</div>
			<div className="mt-4 text-center text-sm">
				ยังไม่มีบัญชีใช่ไหม?{' '}
				<Link href="/register" className="text-[#5AB772] underline">
					สมัครสมาชิก
				</Link>
			</div>
		</form>
	);
}

export default SignInForm;
