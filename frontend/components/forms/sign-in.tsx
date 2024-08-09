'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next';
import type React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { signIn } from '@/lib/elma/actions/sign-in';

const schema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, {
			message: 'min length is 8',
		})
		.max(512, {
			message: 'max length is 128',
		}),
});

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
		const { accessToken } = await signIn(values.email, values.password);
		setCookie('ac-token', accessToken, {
			// httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			// maxAge: 60 * 60 * 24 * 7, // 1 week
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col border">
				<label htmlFor="email">email</label>
				<input
					{...register('email', {
						required: true,
						pattern: {
							value: /\S+@\S+\.\S+/,
							message: 'Entered value does not match email format',
						},
					})}
					type="email"
				/>
				{errors.email && <span role="alert">{errors.email.message}</span>}

				<label htmlFor="password">password</label>
				<input
					id="password"
					{...register('password', {
						required: true,
						minLength: {
							value: 8,
							message: 'min length is 8',
						},
						maxLength: {
							value: 128,
							message: 'max length is 128',
						},
					})}
					type="password"
				/>
				{errors.password && <span role="alert">{errors.password.message}</span>}
				<button type="submit">SUBMIT</button>
			</div>
		</form>
	);
}

export default SignInForm;
