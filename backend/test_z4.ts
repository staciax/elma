import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const ENV = t.Object({
	API_V1_STR: t.Optional(t.String({ default: "/api/v1" })),
	MYSQL_HOST: t.String(),
	MYSQL_PORT: t.String(),
	MYSQL_DB: t.String(),
	MYSQL_PASSWORD: t.String()
});

const A = Value.Errors(ENV, Bun.env);

for (const error of A) {
	console.log(error);
}
