import { InvertedStatusMap } from 'elysia';

type Status = keyof InvertedStatusMap;
type Headers = Record<string, string> | undefined | null;

export class HTTPError extends Error {
	public readonly status: Status;
	public readonly headers?: Headers;

	constructor(status: Status, message?: string, headers?: Headers) {
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
