import z from "zod";

import { env } from "@/config";
import jwt from "@elysiajs/jwt";

const schema = z
	.object({
		db_host: z.string(),
		db_port: z.number(),
		db_name: z.string(),
		db_user: z.string(),
		db_password: z.string()
	})
	.transform((values) => ({
		...values,
		get db_url(): string {
			return `mysql://${values.db_user}:${values.db_password}@${values.db_host}:${values.db_port}/${values.db_name}`;
		}
	}));

const result = schema.safeParse({
	db_host: "localhost",
	db_port: 3306,
	db_name: "classicmodels",
	db_user: "root",
	db_password: "staciadev"
});

z.string().url().parse("foo");

console.log(result.data?.db_host);

if (result.data) {
	console.log("foo is not empty");
}
