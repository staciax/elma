#!/usr/bin/env bun
import { resolve } from 'node:path';
import { env } from '@/config';
import { Glob } from 'bun';
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';
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
	root: string;
	revisions: Record<number, Revision> = {};

	version = 0;
	database_uri: string | null = null;

	constructor(filename = 'migrations/revisions.json') {
		this.root = resolve(import.meta.file, '..');
		this.filename = filename;
	}

	async loadMetadata(): Promise<Revisions> {
		try {
			const file = Bun.file(this.filename);
			const contents = await file.json();
			return {
				version: contents.version,
				database_uri: contents.database_uri,
			};
		} catch {
			return {
				version: 0,
				database_uri: null,
			};
		}
	}

	async getRevisions() {
		const results: Record<string, Revision> = {};
		const glob = new Glob('**/*.sql');
		// TODO: try syncScan
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

	dump() {
		return {
			version: this.version,
			database_uri: this.database_uri,
		};
	}

	async load() {
		this.root = import.meta.dir;
		this.revisions = await this.getRevisions();
		const data = await this.loadMetadata();
		this.version = data.version;
		this.database_uri = data.database_uri;
		return data;
	}

	async save() {
		const data = JSON.stringify(this.dump(), null, 4);
		await Bun.write(this.filename, data);
	}

	isNextRevisionTaken() {
		return this.version + 1 in this.revisions;
	}

	get orderedRevisions(): Revision[] {
		return Object.values(this.revisions).sort((a, b) => a.version - b.version);
	}

	async createRivision(reason: string, kind = 'V'): Promise<Revision> {
		const cleaned = reason.replace(/\s/g, '_');
		const filename = `${kind}${this.version + 1}__${cleaned}.sql`;
		const path = resolve(this.root, 'migrations', filename);

		let stub = '';
		stub += `-- Revises: V${this.version}\n`;
		stub += `-- Creation Date: ${new Date().toISOString()} UTC\n`;
		stub += `-- Reason: ${reason}\n\n`;

		await Bun.write(path, stub);

		this.save();
		return new Revision(kind, this.version + 1, reason, path);
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

async function init() {
	const migrations = new Migrations();
	await migrations.load();
	migrations.database_uri = env.DATABASE_URI;

	try {
		const applied = await runUpgrade(migrations);
		console.log(`Successfully initialized and applied ${applied} revisions(s)`);
	} catch (err) {
		console.error(err);
	}
}

async function migrate(reason: string) {
	const migrations = new Migrations();
	await migrations.load();
	if (migrations.isNextRevisionTaken()) {
		console.log(
			'an unapplied migration already exists for the next version, exiting',
		);
		console.log('hint: apply pending migrations with the `upgrade` command');
		return;
	}
	const revision = await migrations.createRivision(reason);
	console.log(`Created revision V${revision.version}`);
}

async function upgrade(sql: boolean) {
	const migrations = new Migrations();
	await migrations.load();

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
}

async function current() {
	const migrations = new Migrations();
	await migrations.load();
	console.info('Version', migrations.version);
}

async function log() {
	const migrations = new Migrations();
	await migrations.load();
	const revs = migrations.orderedRevisions;
	for (const rev of revs) {
		console.info(`V${rev.version} ${rev.description.replace('_', ' ')}`);
	}
}

yargs(hideBin(process.argv))
	.scriptName('migrations')
	.usage('$0 <cmd> [args]')
	.command(
		'init',
		'Initializes the database and runs all the current migrations',
		async () => await init(),
	)
	.command(
		'migrate [reason]',
		'Creates a new revision for you to edit.',
		(yargs) => {
			yargs
				.positional('reason', {
					describe: 'The reason for this revision.',
					type: 'string',
					alias: 'r',
				})
				.demandOption('reason');
		},
		async (argv: Arguments) => await migrate(argv.reason as string),
	)
	.command(
		'upgrade [sql]',
		'Upgrades the database at the given revision (if any).',
		(yargs) => {
			yargs.positional('sql', {
				describe: 'Print the SQL instead of executing it',
				type: 'boolean',
				default: false,
			});
		},
		async (argv: Arguments) => await upgrade(argv.sql as boolean),
	)
	.command(
		'current',
		'Shows the current active revision version',
		async () => await current(),
	)
	.command('log', 'Displays the revision history', async () => await log())
	.demandCommand()
	.help()
	.parse();
