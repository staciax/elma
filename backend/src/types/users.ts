import type { UserPublic } from "@/schemas/users";
import type { UnwrapSchema } from "elysia";
import type { RowDataPacket } from "mysql2";

export type UserRow = RowDataPacket &
	(UnwrapSchema<typeof UserPublic> & {
		hashed_password: string;
	});
