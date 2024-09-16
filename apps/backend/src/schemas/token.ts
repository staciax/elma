import { t } from 'elysia';

export const Token = t.Object({
	access_token: t.String(),
	token_type: t.Optional(t.String({ default: 'bearer' })),
	// TODO: implement refresh token
});
