import { InvertedStatusMap } from 'elysia';

export class HTTPError<
	Status extends keyof InvertedStatusMap, // | keyof StatusMap,
	Message extends string,
	Headers extends Record<string, string> | undefined | null,
> extends Error {
	public readonly status: Status;
	public readonly headers?: Headers;

	constructor(status: Status, message?: Message, headers?: Headers) {
		if (!message && typeof status === 'number') {
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
