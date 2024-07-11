import { Elysia } from "elysia";

import { router as sign_router } from "./routes/sign";

export const router = new Elysia({ prefix: "/api" }).use(sign_router);
