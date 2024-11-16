import { HTTPError } from "@/errors";
import { currentUser, superuser } from "@/plugins/auth";
import { Elysia, t } from "elysia";
import { type ResultSetHeader, type RowDataPacket, format } from "mysql2";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

export const router = new Elysia({
	prefix: "/test",
	detail: {
		hide: true
	}
})
	.get(
		"/file/:filename",
		async ({ params: { filename } }) => {
			const file = Bun.file(`./../frontend/public/${filename}`);
			return file;
		},
		{
			params: t.Object({
				filename: t.String()
			})
		}
	)
	.post(
		"/upload",
		async ({ body: { image } }) => {
			if (image.size > MAX_FILE_SIZE) {
				throw new HTTPError(400, "File size must be less than 5MB");
			}
			// const extension = image.type.split("/")[1];
			// const filename = `${title}.${extension}`;

			const filename = image.name;
			const path = `./../frontend/public/${filename}`;
			const file = Bun.file(path);

			if (await file.exists()) {
				throw new HTTPError(400, `File '${filename}' already exists`);
			}

			await Bun.write(file, image);

			// TODO: save file path to book table

			return { message: `File '${filename}' uploaded successfully` };
		},
		{
			body: t.Object({
				image: t.Union([
					t.File({ type: "image/jpeg" }),
					t.File({ type: "image/png" })
				])
			})
		}
		// TODO: route for deleting file, updating file, etc.
	);
