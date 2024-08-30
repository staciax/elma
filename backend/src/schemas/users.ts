import { t } from 'elysia';

export const SignUpDTO = t.Object({
	email: t.String({ format: 'email', error: 'Invalid email' }),
	password: t.String({ minLength: 8 }),
	first_name: t.Optional(t.String()),
	last_name: t.Optional(t.String()),
});

export const SignInDTO = t.Object({
	username: t.String({ format: 'email', error: 'Invalid email' }),
	password: t.String({ minLength: 8, error: 'Invalid password' }),
	// client_id: t.Optional(t.String()),
	// grant_type: t.Optional(t.String({ default: 'password' })),
	// scope: t.Optional(t.String()),
});

export const UserPublic = t.Object({
	id: t.String({ format: 'uuid', error: 'Invalid UUID' }),
	email: t.String({ format: 'email', error: 'Invalid email' }),
	hashed_password: t.String(),
	first_name: t.Nullable(t.String()),
	last_name: t.Nullable(t.String()),
	is_superuser: t.Boolean(),
	is_active: t.Boolean(),
	is_staff: t.Boolean(),
	created_at: t.Date({ default: new Date() }),
	updated_at: t.Date({ default: new Date() }),
	// orders: t.Any(),
	// shopping_carts: t.Any(),
});

export const UsersPublic = t.Object({
	count: t.Number(),
	data: t.Array(UserPublic),
});

export const UserCreate = t.Object({
	email: t.String({ format: 'email', error: 'Invalid email' }),
	password: t.String(),
	first_name: t.Optional(t.String()),
	last_name: t.Optional(t.String()),
	is_active: t.Optional(t.Boolean({ default: true })),
	is_staff: t.Optional(t.Boolean({ default: false })),
});

export const UserUpdate = t.Object({
	email: t.Optional(t.String({ format: 'email' })),
	password: t.Optional(t.String({ minLength: 8 })),
	first_name: t.Optional(t.String()),
	last_name: t.Optional(t.String()),
	is_active: t.Optional(t.Boolean()),
	is_staff: t.Optional(t.Boolean()),
});

export const UserMeUpdate = t.Object({
	email: t.Optional(t.String({ format: 'email' })),
	password: t.Optional(t.String({ minLength: 8 })),
	first_name: t.Optional(t.String()),
	last_name: t.Optional(t.String()),
});

export const UpdatePasswordDTO = t.Object({
	password: t.String({ minLength: 8, error: 'Invalid password' }),
	new_password: t.String({ minLength: 8, error: 'Invalid password' }),
});
