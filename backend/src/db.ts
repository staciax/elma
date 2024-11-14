import { env } from "@/config";

import mysql from "mysql2/promise";

export const pool = mysql.createPool(env.DATABASE_URI);
