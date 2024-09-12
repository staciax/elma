'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import type { UserPublic } from '@/lib/elma/types';
// import { BellRing, Check } from 'lucide-react';
// import type React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	email: z.string(),
	phone_number: z.string(),
});

type Props = {
	user: UserPublic;
};

// TODO: zod validation

// const AccountForm = ({ user }: Props) => {
// 	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
// 		event.preventDefault();
// 		const _formData = new FormData(event.currentTarget);
// 	};
// 	return (
// 		<form onSubmit={onSubmit}>
// 			<div className="mx-auto w-full max-w-[50rem] px-4 pt-10 pb-12 ">
// 				<div className="rounded-md bg-white p-8 shadow-md">
// 					<h3 className="font-semibold text-2xl">บัญชีของฉัน</h3>
// 					{/* TODO: react hook form + zod */}
// 					<div className="mt-4 grid grid-cols-2 gap-4">
// 						<div className="grid gap-2">
// 							<Label htmlFor="first-name">ชื่อ</Label>
// 							<Input
// 								id="first-name"
// 								name="first_name"
// 								type="text"
// 								placeholder="ชื่อ"
// 								maxLength={255}
// 								defaultValue={user.first_name}
// 							/>
// 						</div>
// 						<div className="grid gap-2">
// 							<Label htmlFor="last-name">นามสกุล</Label>
// 							<Input
// 								id="last_name"
// 								name="last_name"
// 								type="text"
// 								placeholder="นามสกุล"
// 								maxLength={255}
// 								defaultValue={user.last_name}
// 							/>
// 						</div>
// 						<div>
// 							<Label htmlFor="email">อีเมล</Label>
// 							<Input
// 								id="email"
// 								name="email"
// 								type="email"
// 								placeholder="อีเมล"
// 								maxLength={255}
// 								readOnly={true}
// 								className="cursor-not-allowed"
// 								defaultValue={user.email}
// 							/>
// 						</div>
// 						<div>
// 							<Label htmlFor="phone-number">เบอร์โทรศัพท์</Label>
// 							<Input
// 								id="phone_number"
// 								name="phone_number"
// 								type="text"
// 								placeholder="เบอร์โทรศัพท์"
// 								maxLength={15}
// 								defaultValue={'***REMOVED***'}
// 							/>
// 						</div>
// 						{/* TODO: format phone when unforcus and when focus show default */}
// 					</div>
// 					<div className="mt-4">
// 						<Button type="submit">บันทึก</Button>
// 					</div>
// 				</div>
// 			</div>
// 		</form>
// 	);
// };

const AccountForm = ({ user }: Props) => {
	// const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
	// 	event.preventDefault();
	// 	const _formData = new FormData(event.currentTarget);
	// };
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			phone_number: user.phone_number,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="first_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>ชื่อ</FormLabel>
								<FormControl>
									<Input {...field} maxLength={255} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="last_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>นามสกุล</FormLabel>
								<FormControl>
									<Input {...field} maxLength={255} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>อีเมล</FormLabel>
								<FormControl>
									<Input {...field} maxLength={320} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="phone_number"
						render={({ field }) => (
							<FormItem>
								<FormLabel>เบอร์โทรศัพท์</FormLabel>
								<FormControl>
									<Input {...field} maxLength={20} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<Button type="submit" className="w-20">
					บันทึก
				</Button>
			</form>
		</Form>
	);
};

export default function AccountContent({ user }: Props) {
	return (
		<section className="grid w-full gap-4 bg-[rgba(144,200,75,0.1)]">
			<Card className="mx-auto w-full max-w-[48rem]">
				<CardHeader>
					<CardTitle className="text-2xl">บัญชีของฉัน</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					<AccountForm user={user} />
				</CardContent>
				{/* <CardFooter>
					<Button type="submit" className="w-20">
						บันทึก
					</Button>
				</CardFooter> */}
			</Card>

			<Card className="mx-auto w-full max-w-[48rem]">
				<CardHeader>
					<CardTitle className="text-2xl">เปลี่ยนรหัสผ่าน</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					{/* TODO: Form hare */}
					<div className="grid w-full max-w-xs items-center gap-1.5">
						<Label htmlFor="email">รหัสผ่าน</Label>
						<Input type="email" id="email" />
					</div>
					<div className="grid w-full max-w-xs items-center gap-1.5">
						<Label htmlFor="email">รหัสผ่านใหม่</Label>
						<Input type="email" id="email" />
					</div>
					<div className="grid w-full max-w-xs items-center gap-1.5">
						<Label htmlFor="email">ยืนยันรหัสผ่านใหม่</Label>
						<Input type="email" id="email" />
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-20">
						บันทึก
					</Button>
				</CardFooter>
			</Card>
		</section>
	);
}
