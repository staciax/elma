import { Elysia } from 'elysia';

const _resolvedUser = new Elysia().resolve({ as: 'global' }, () => {
	return { user: 'I am a user' };
});
