import z from "zod";

const schema = z
	.object({
		foo: z.string().transform((value) => {
			console.log("transform foo");
			return value.trim();
		})
	})
	.transform((values) => {
		console.log("transform object");
		return { ...values };
	})
	.readonly();

const result = schema.safeParse({
	foo: "  bar  "
});

const data = result.data;

console.log(data);
