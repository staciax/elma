'use client';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { UserPublic } from '@/lib/elma/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	email: z.string(),
	phone_number: z.string(),
});

type Props = {
	user: UserPublic;
};

export default function AccountForm({ user }: Props) {
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
		<Card className="mx-auto w-full max-w-[48rem]">
			<CardHeader>
				<CardTitle className="text-2xl">บัญชีของฉัน</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
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
			</CardContent>
		</Card>
	);
}
