#!/usr/bin/env bun
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
	.scriptName('db')
	.command(
		'migrate [reason]',
		'show current migration version',
		(yargs) => {
			yargs
				.positional('reason', {
					describe: 'The reason for this revision.',
					type: 'string',
					alias: 'r',
				})
				.demandOption('reason');
		},
		async (argv: Arguments) => {
			console.log('migrate', argv.reason);
		},
	)
	.demandCommand()
	.help()
	.parse();
