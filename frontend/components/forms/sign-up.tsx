'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next';
import type React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { signIn } from '@/lib/elma/actions/sign-in';
import { signUp } from '@/lib/elma/actions/sign-up';

const schema = z.object({
	email: z.string().email(),
	password1: z
		.string()
		.min(8, {
			message: 'min length is 8',
		})
		.max(512, {
			message: 'max length is 128',
		}),
	password2: z
		.string()
		.min(8, {
			message: 'min length is 8',
		})
		.max(512, {
			message: 'max length is 128',
		}),
	firstName: z.string().min(1).max(128),
	lastName: z.string().min(1).max(128),
});

function SignUpForm() {
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
			password1: '',
			password2: '',
			firstName: '',
			lastName: '',
		},
	});

	async function onSubmit(values: Schema) {
		const { email, password1, password2, firstName, lastName } = values;

		// TODO: zod validation should catch this
		if (password1 !== password2) {
			console.log('passwords do not match');
			return;
		}

		const user = await signUp(email, password1, firstName, lastName);
		const { accessToken } = await signIn(values.email, values.password1);
		setCookie('ac-token', accessToken, {
			// httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			// maxAge: 60 * 60 * 24 * 7, // 1 week
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col border">
				<label htmlFor="firstName">fisrt name</label>
				<input
					id="firstName"
					{...register('firstName', {
						required: true,
					})}
				/>
				{errors.firstName && <span role="alert">{errors.firstName.message}</span>}

				<label htmlFor="lastName">last name</label>
				<input
					id="lastName"
					{...register('lastName', {
						required: true,
					})}
				/>
				{errors.lastName && <span role="alert">{errors.lastName.message}</span>}

				<label htmlFor="email">email</label>

				<input
					id="email"
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

				<label htmlFor="password1">password</label>
				<input
					id="password1"
					{...register('password1', {
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
				{errors.password1 && <span role="alert">{errors.password1.message}</span>}

				<label htmlFor="password2">confirm password</label>
				<input
					id="password2"
					{...register('password2', {
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
				{errors.password2 && <span role="alert">{errors.password2.message}</span>}

				<button type="submit">SUBMIT</button>
			</div>
		</form>
	);
}

export default SignUpForm;
