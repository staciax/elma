'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/elma/actions/sign-in';
import { signUp } from '@/lib/elma/actions/sign-up';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AxiosError, isAxiosError } from 'axios';
import { setCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z
	.object({
		email: z.string().email(),
		password: z
			.string()
			.min(8, {
				message: 'min length is 8',
			})
			.max(512, {
				message: 'max length is 128',
			}),
		confirm_password: z.string(),
		first_name: z
			.string()
			.min(1, {
				message: 'min length is 1',
			})
			.max(128, {
				message: 'max length is 128',
			}),
		last_name: z
			.string()
			.min(1, {
				message: 'min length is 1',
			})
			.max(128, {
				message: 'max length is 128',
			}),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'passwords do not match',
		path: ['confirmPassword'],
	});

function SignUpForm() {
	const router = useRouter();
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
			confirm_password: '',
			first_name: '',
			last_name: '',
		},
	});

	async function onSubmit(values: Schema) {
		const { email, password, first_name, last_name } = values;

		try {
			await signUp(email, password, first_name, last_name);
		} catch (error) {
			// if (error instanceof AxiosError) {
			// 	toast.error('สมัครสมาชิกไม่สำเร็จ', {
			// 		description: error.message,
			// 	});
			// } else {
			console.error(error);
			toast.error('สมัครสมาชิกไม่สำเร็จ', {
				description: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
				duration: 5000,
			});
			// }
			return;
		}
		toast.success('สมัครสมาชิกสำเร็จ', { duration: 5000 });
		const { access_token } = await signIn(email, values.password);
		setCookie('ac-token', access_token, {
			// httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			// maxAge: 60 * 60 * 24 * 7, // 1 week
		});
		router.push('/');
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="grid gap-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="first_name">ชื่อ</Label>
						<Input id="first_name" {...register('first_name')} maxLength={128} required />
						{errors.first_name && <span role="alert">{errors.first_name.message}</span>}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="last_name">นามสกุล</Label>
						<Input id="last_name" {...register('last_name')} maxLength={128} required />
						{errors.last_name && <span role="alert">{errors.last_name.message}</span>}
					</div>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="email">อีเมล</Label>
					<Input id="email" type="email" placeholder="m@example.com" {...register('email')} maxLength={256} required />
					{errors.email && <span role="alert">{errors.email.message}</span>}
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password">รหััสผ่าน</Label>
					<Input id="password" type="password" {...register('password')} />
					{errors.password && <span role="alert">{errors.password.message}</span>}
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password-comfirm">ยืนยันรหัสผ่าน</Label>
					<Input
						id="password-comfirm"
						type="password"
						className="focus:border-[#5AB772] focus:outline-[#5AB772] focus:ring-[#5AB772]"
						{...register('confirm_password')}
						minLength={8}
						maxLength={255}
					/>
					{errors.confirm_password && <span role="alert">{errors.confirm_password.message}</span>}
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
		</form>
		// <form onSubmit={handleSubmit(onSubmit)}>
		// 	<div className="flex flex-col border">
		// 		<label htmlFor="first_name">fisrt name</label>
		// 		<input
		// 			id="first_name"
		// 			{...register('first_name', {
		// 				required: true,
		// 			})}
		// 		/>
		// 		{errors.first_name && <span role="alert">{errors.first_name.message}</span>}

		// 		<label htmlFor="last_name">last name</label>
		// 		<input
		// 			id="last_name"
		// 			{...register('last_name', {
		// 				required: true,
		// 			})}
		// 		/>
		// 		{errors.last_name && <span role="alert">{errors.last_name.message}</span>}

		// 		<label htmlFor="email">email</label>

		// 		<input
		// 			id="email"
		// 			{...register('email', {
		// 				required: true,
		// 				pattern: {
		// 					value: /\S+@\S+\.\S+/,
		// 					message: 'Entered value does not match email format',
		// 				},
		// 			})}
		// 			type="email"
		// 		/>
		// 		{errors.email && <span role="alert">{errors.email.message}</span>}

		// 		<label htmlFor="password">password</label>
		// 		<input
		// 			id="password"
		// 			{...register('password', {
		// 				required: true,
		// 				minLength: {
		// 					value: 8,
		// 					message: 'min length is 8',
		// 				},
		// 				maxLength: {
		// 					value: 128,
		// 					message: 'max length is 128',
		// 				},
		// 			})}
		// 			type="password"
		// 		/>
		// 		{errors.password && <span role="alert">{errors.password.message}</span>}

		// 		<label htmlFor="confirm_password">confirm password</label>
		// 		<input
		// 			id="confirm_password"
		// 			{...register('confirm_password', {
		// 				required: true,
		// 				minLength: {
		// 					value: 8,
		// 					message: 'min length is 8',
		// 				},
		// 				maxLength: {
		// 					value: 128,
		// 					message: 'max length is 128',
		// 				},
		// 			})}
		// 			type="password"
		// 		/>
		// 		{errors.confirm_password && <span role="alert">{errors.confirm_password.message}</span>}

		// 		<button type="submit">SUBMIT</button>
		// 	</div>
		// </form>
	);
}

export default SignUpForm;
