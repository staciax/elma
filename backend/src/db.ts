// import { env } from '@/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	database: 'elma',
	port: 3306,
	password: 'staciadev',
});
