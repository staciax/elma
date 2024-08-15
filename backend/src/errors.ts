export class HTTPError extends Error {
	status_code: number;
	headers: Record<string, string> | undefined;
	constructor(
		status_code: number,
		message: string,
		headers?: Record<string, string>,
	) {
		super(message);
		this.status_code = status_code;
		this.headers = headers;
	}
}
