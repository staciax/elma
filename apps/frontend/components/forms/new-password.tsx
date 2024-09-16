'use client';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
	current_password: z.string().min(1).max(255),
	new_password: z.string().min(8).max(255),
	confirm_new_password: z.string().min(8).max(255),
});

export default function NewPasswordForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			current_password: '',
			new_password: '',
			confirm_new_password: '',
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}

	return (
		<Card className="mx-auto w-full max-w-[48rem]">
			<CardHeader>
				<CardTitle className="text-2xl">เปลี่ยนรหัสผ่าน</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="current_password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>รหัสผ่าน</FormLabel>
									<FormControl>
										<Input {...field} maxLength={255} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="new_password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>รหัสผ่านใหม่</FormLabel>
									<FormControl>
										<Input {...field} maxLength={255} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirm_new_password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
									<FormControl>
										<Input {...field} maxLength={255} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-20">
							บันทึก
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
