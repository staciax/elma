import { InvertedStatusMap, type StatusMap } from 'elysia';

export class HTTPError<
	Status extends keyof StatusMap | keyof InvertedStatusMap, // or number
> extends Error {
	status: Status;
	headers?: Record<string, string> | undefined;

	constructor(
		status: Status,
		message?: string,
		headers?: Record<string, string> | undefined,
	) {
		console.log(typeof status);
		if (!message && typeof status === 'number') {
			// @ts-ignore
			const pharse = InvertedStatusMap[status];
			if (!pharse) {
				throw new Error('Invalid status code');
			}
			super(pharse);
		} else {
			super(message);
		}
		this.status = status;
		this.headers = headers;
	}
}
