import { t } from 'elysia';

export const Login = t.Object({
	username: t.String({
		format: 'email',
		maxLength: 320,
		// error: 'Invalid email',
	}),
	password: t.String({
		// minLength: 8,
		minLength: 1, // TODO: fix this 1 or 8?
		maxLength: 255,
		// error: 'Invalid password',
	}),

	// OAuth2.0 fields
	// client_id: t.Optional(t.String()),
	// client_secret: t.Optional(t.String()),
	// grant_type: t.Optional(t.String({ default: 'password' })),
	// scope: t.Optional(t.String()),
});
