import { app } from './app';
import { env } from './config';

app.listen(
	{
		port: env.PORT,
		hostname: env.HOSTNAME,
	},
	// (server) => {},
);

console.log(
	`🦊 Elysia is running at ${env.NODE_ENV !== 'production' ? 'http://' : 'https://'}${app.server?.hostname}:${app.server?.port}`,
);
// TODO: add this repo to the ElysiaJS Awesome list https://github.com/elysiajs/awesome-elysia
// TODO: biomejs github action hook https://biomejs.dev/recipes/git-hooks/
// TODO: add more github actions like biomejs lint, test, build, etc.
// TODO: add logger plugin
// TODO: hostname http or https
