export class MissingAttributeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidParamError';
	}
}
