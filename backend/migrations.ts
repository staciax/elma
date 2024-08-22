import { resolve } from 'node:path';
import { env } from '@/config';
import { Glob } from 'bun';
import z from 'zod';

import mysql from 'mysql2/promise';

const REVISION_FILE = /(?<kind>V|U)(?<version>[0-9]+)__(?<description>.+).sql/;
const revSchema = z.object({
	kind: z.union([z.literal('V'), z.literal('U')]),
	version: z.number({ coerce: true }).int().nonnegative(),
	description: z.string().min(1),
});
type Revisions = {
	version: number;
	database_uri: string | null;
};

class Revision {
	kind: string;
	version: number;
	description: string;
	file: string;
	constructor(
		kind: string,
		version: number,
		description: string,
		file: string,
	) {
		this.kind = kind;
		this.version = version;
		this.description = description;
		this.file = file;
	}

	static fromSchema(schema: z.infer<typeof revSchema>, file: string): Revision {
		return new Revision(schema.kind, schema.version, schema.description, file);
	}
}

class Migrations {
	filename: string;
	root: string | undefined;
	revisions: Record<number, Revision> = {};

	version = 0;
	database_uri: string | null = null;

	constructor(filename = 'migrations/revisions.json') {
		this.filename = filename;
	}

	async setup() {
		this.root = import.meta.dir;
		this.revisions = await this.getRevisions();
		await this.load();
	}

	async getRevisions() {
		const results: Record<string, Revision> = {};
		const glob = new Glob('**/*.sql');
		for await (const file of glob.scan('.')) {
			const match = file.match(REVISION_FILE);
			const result = revSchema.safeParse(match?.groups);
			if (result.success) {
				const rev = Revision.fromSchema(result.data, file);
				results[rev.version] = rev;
			}
		}
		return results;
	}

	async load() {
		const data = await this.loadMetadata();
		this.version = data.version;
		this.database_uri = data.database_uri || null;
		return data;
	}

	async save() {
		const data = JSON.stringify(this.dump, null, 4);
		await Bun.write(this.filename, data);
	}

	async loadMetadata(): Promise<Revisions> {
		try {
			const file = Bun.file(this.filename);
			const contents = await file.json();
			return {
				version: contents.version,
				database_uri: contents.database,
			};
		} catch {
			return {
				version: 0,
				database_uri: null,
			};
		}
	}

	get dump() {
		return {
			version: this.version,
			database_uri: this.database_uri,
		};
	}

	get isNextRevisionTaken() {
		return this.version + 1 in this.revisions;
	}

	async createRivision(reason: string, kind = 'V'): Promise<Revision> {
		const cleaned = reason.replace(/\s/g, '_');
		const filename = `${kind}${this.version + 1}__${cleaned}.sql`;
		const path = resolve(import.meta.file, '..', 'migrations', filename);

		let stub = '';
		stub += `-- Revises: V${this.version}\n`;
		stub += `-- Creation Date: ${new Date().toISOString()} UTC\n`;
		stub += `-- Reason: ${reason}\n\n`;

		await Bun.write(path, stub);

		this.save();
		return new Revision(kind, this.version + 1, reason, path);
	}

	get orderedRevisions(): Revision[] {
		return Object.values(this.revisions).sort((a, b) => a.version - b.version);
	}

	async upgrade(conn: mysql.Connection) {
		const ordered = this.orderedRevisions;
		let successes = 0;

		await conn.beginTransaction();

		for (const rev of ordered) {
			if (rev.version > this.version) {
				// const sql = await Bun.read(rev.file);
				// const sql = '';
				// await await conn.execute(sql);
				successes++;
			}
		}
		await conn.commit();

		// await conn.end();

		this.version += successes;
		this.save();

		return successes;
	}

	display() {
		const ordered = this.orderedRevisions;
		for (const rev of ordered) {
			if (rev.version > this.version) {
				const sql = '';
				console.log(sql);
			}
		}
	}
}

async function runUpgrade(migrations: Migrations) {
	const conn = await mysql.createConnection(env.DATABASE_URI);
	const rev = await migrations.upgrade(conn);
	await conn.end();
	return rev;
}

export async function init() {
	const migrations = new Migrations();
	await migrations.setup();

	try {
		const applied = await runUpgrade(migrations);
		console.log(`Successfully initialized and applied ${applied} revisions(s)`);
	} catch (err) {
		console.error(err);
	}
}

export async function upgrade(sql = false) {
	const migrations = new Migrations();
	await migrations.setup();

	if (sql) {
		migrations.display();
		return;
	}

	try {
		const applied = await runUpgrade(migrations);
		console.log(`Successfully initialized and applied ${applied} revisions(s)`);
	} catch (err) {
		console.error(err);
		console.log('failed to apply migrations due to error');
	}

	return;
}

export async function current() {
	const migrations = new Migrations();
	await migrations.setup();
	console.info('Version', migrations.version);
}

export async function log() {
	const migrations = new Migrations();
	await migrations.setup();
	const revs = migrations.orderedRevisions;
	for (const rev of revs) {
		console.info(`V${rev.version} ${rev.description.replace('_', ' ')}`);
	}
}

// await init();
// await upgrade();
// await current();
// await log();

//
// const migrations = new Migrations();
// await migrations.setup();
// // await migrations.createRivision('fix 2');
// // await migrations.upgrade();

// migrations.show();

// const path = await Bun.resolve(import.meta.dir, '..');
// console.log(path);
// console.log(path.resolve(import.meta.file, '..'));
// console.log(migrations);

// console.log('import.meta.dir', import.meta.dir);
// const root = await Bun.resolve(import.meta.file, '.');
// console.log('root', root);

// const root = await Bun.resolve(import.meta.path, '../migrations');
// for await (const file of glob.scan('.')) {
// 	console.log('file', file);
// 	const match = file.match(REVISION_FILE);
// 	if (match) {
// 		const rev = Revision.fromMatch(match, file);
// 		console.log(rev);
// 	}
// 	// const { kind, version, description } = revSchema.parse(match?.groups);
// 	// console.log('kind', kind);
// 	// console.log('version', version);
// 	// console.log('description', description);
// 	// const rev = new Revision(kind, version, description, file);

// 	// const groups: Partial<RegexRevisionFile> | undefined = match?.groups;
// 	// if (match && groups) {
// 	// 	const { kind, version, description } = groups;
// 	// 	console.log('kind', kind);
// 	// 	console.log('version', version);
// 	// 	console.log('description', description);
// 	// 	const rev = Revision.fromMatch(match, file);
// 	// }
// }

// const getRevisions = async (): Promise<Record<number, Revision>> => {
// 	const results: Record<string, Revision> = {};

// 	const glob = new Glob('**/*.sql');

// 	for await (const file of glob.scan('.')) {
// 		const match = file.match(REVISION_FILE);
// 		const result = revSchema.safeParse(match?.groups);
// 		if (result.success) {
// 			const rev = Revision.fromSchema(result.data, file);
// 			results[rev.version] = rev;
// 		}
// 	}
// 	return results;
// };

// const revisions = await getRevisions();
// for (const [key, value] of Object.entries(revisions)) {
// 	console.log(key, value);
// }

// const root = resolve(import.meta.path, '..');
// console.log(root);
