export class MissingAttributeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidParamError';
	}
}

export const INVALID_EVENT_NAME =
	'event name should match resource.origin.action or resource.origin.action.dest patterns';
