#!/usr/bin/env bun
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { current, init, log, upgrade } from './migrations';

yargs(hideBin(process.argv))
	.scriptName('db')
	.usage('$0 <cmd> [args]')
	.command('init', 'initialize the database', async () => {
		await init();
	})
	.command('current', 'show current migration version', async () => {
		await current();
	})
	.command('log', 'show migration log', async () => {
		await log();
	})
	.command(
		'upgrade [sql]',
		'upgrade database to latest version',
		(yargs) => {
			yargs.positional('sql', {
				describe: 'Print the SQL instead of executing it',
				type: 'boolean',
				default: false,
			});
		},
		async (argv: Arguments) => {
			await upgrade(argv.sql as boolean);
		},
	)
	.demandCommand()
	.help()
	.parse();
