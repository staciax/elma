import { t } from 'elysia';

// TODO: regex pattern for password

export const UserRegiser = t.Object({
	email: t.String({ format: 'email' }), // TODO: max length?
	password: t.String({ minLength: 8, maxLength: 255 }),
	first_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	last_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	phone_number: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
});

export type UserRole =
	| 'SUPERUSER'
	| 'ADMIN'
	| 'MANAGER'
	| 'EMPLOYEE'
	| 'CUSTOMER';

export const UserPublic = t.Object({
	id: t.String({ format: 'uuid' }),
	email: t.String({ format: 'email' }),
	first_name: t.Nullable(t.String()),
	last_name: t.Nullable(t.String()),
	phone_number: t.Nullable(t.String()),
	hashed_password: t.String(),
	role: t.String(),
	is_active: t.Integer(), // TODO: cast to boolean
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const UsersPublic = t.Object({
	count: t.Integer(),
	data: t.Array(UserPublic),
});

export const UserCreate = t.Object({
	email: t.String({ format: 'email', maxLength: 320 }),
	password: t.String({ minLength: 8, maxLength: 255 }),
	first_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	last_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	phone_number: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
	role: t.Union([
		t.Literal('SUPERUSER'),
		t.Literal('ADMIN'),
		t.Literal('MANAGER'),
		t.Literal('EMPLOYEE'),
		t.Literal('CUSTOMER'),
	]),
	is_active: t.Optional(t.Boolean({ default: true })),
});

export const UserUpdate = t.Partial(UserCreate);

export const UserMePublic = t.Omit(UserPublic, [
	'hashed_password',
	'role',
	'is_active',
	'created_at',
	'updated_at',
]);

export const UserMeUpdate = t.Partial(UserMePublic);

export const UpdatePassword = t.Object({
	current_password: t.String({ minLength: 1, maxLength: 255 }),
	new_password: t.String({ minLength: 8, maxLength: 255 }),
});

// export const UserMeUpdate = t.Object({
// 	email: t.Optional(t.String({ format: 'email', maxLength: 320 })),
// 	first_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
// 	last_name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
// 	phone_number: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
// });
