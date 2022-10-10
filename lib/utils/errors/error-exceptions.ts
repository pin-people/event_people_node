export class MissingAttributeError extends Error {
	constructor(message: string) {
		super(`Invalid param: ${message}`);
		this.name = 'InvalidParamError';
	}
}
