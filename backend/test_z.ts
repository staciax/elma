import z from "zod";

// import { env } from '@/config';
// import jwt from '@elysiajs/jwt';

const schema = z.object({
	foo: z
		.string()
		.optional()
		.transform((value) => (value ? value.split(",") : undefined))
		.pipe(
			z
				.union([z.string().trim().url(), z.literal("*")])
				.array()
				.optional()
			// .default([]),
		)
	// not ends with '/'
	// api_v1: z
	// 	.string()
	// 	.trim()
	// 	.startsWith('/', { message: "A path prefix must start with '/'" })
	// 	.refine((value) => !value.endsWith('/'), {
	// 		message:
	// 			"A path prefix must not end with '/', as the routes will start with '/'",
	// 	}),
});

const result = schema.safeParse({ api_v1: "/api/v1" });

console.log(result);

if (result.data) {
	console.log("foo is not empty");
}

// .string()
// .optional()
// .transform((value) => (value ? value.split(',') : []))
// .transform((value) => (value ? value.split(',') : []))
// .pipe(z.string().trim().url().or(z.literal('*')).array()),

// z.union([z.string().trim().url(), z.literal('*')])
// 	.array()
// 	.optional()
// 	.default([]);
// z.string().trim().url().or(z.literal('*')).array().optional().default([]),
// .pipe(
// 	z.string().trim().url().or(z.literal('*')).array().optional().default([]),
// ),
