import z from 'zod';

const schema = z.object({
	foo: z
		.union([
			z.string().refine((value) => /^\d+[smhdwMy]$/.test(value)),
			z
				.number({ coerce: true })
				.positive()
				.transform((value) => {
					// return new Date().setTime(new Date().getTime() + value * 60_000);
					return new Date().getTime() + value;
				}),
		])
		.default('1d'),
});
const _result = schema.parse({ foo: 2 });

const dt = new Date();
dt.setTime(new Date().getTime() + 5 * 60_000);
// const dt = console.log(dt);
