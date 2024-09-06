'use client';

import { signIn } from '@/lib/elma/actions/sign-in';
import { signUp } from '@/lib/elma/actions/sign-up';
import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next';
import { useForm } from 'react-hook-form';
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
		confirmPassword: z.string(),
		firstName: z
			.string()
			.min(1, {
				message: 'min length is 1',
			})
			.max(128, {
				message: 'max length is 128',
			}),
		lastName: z
			.string()
			.min(1, {
				message: 'min length is 1',
			})
			.max(128, {
				message: 'max length is 128',
			}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'passwords do not match',
		path: ['confirmPassword'],
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
			password: '',
			confirmPassword: '',
			firstName: '',
			lastName: '',
		},
	});

	async function onSubmit(values: Schema) {
		const { email, password, firstName, lastName } = values;

		const user = await signUp(email, password, firstName, lastName);
		const { access_token } = await signIn(user.email, values.password);
		setCookie('ac-token', access_token, {
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

				<label htmlFor="confirmPassword">confirm password</label>
				<input
					id="confirmPassword"
					{...register('confirmPassword', {
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
				{errors.confirmPassword && <span role="alert">{errors.confirmPassword.message}</span>}

				<button type="submit">SUBMIT</button>
			</div>
		</form>
	);
}

export default SignUpForm;
