import { app } from './app';

app.listen(
	{
		port: 8000,
		// hostname: env.HOSTNAME,
	},
	// (server) => {},
);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
