import { setEnvs } from '../../example/set-envs';
import {
	Config,
	Event,
	INVALID_EVENT_NAME,
	MissingAttributeError,
} from '../../lib';

describe('lib/event.ts', () => {
	beforeAll(() => {
		setEnvs();
	});
	beforeAll(() => {
		new Config();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	it('payload() - should return payload', () => {
		const name = 'some.custom.action.dest';
		const body = { text: 'message body' };
		const schemaVersion = 1.3;
		const event = new Event(name, body, schemaVersion);
		const headers = {
			appName: Config.APP_NAME,
			resource: 'some',
			origin: 'custom',
			action: 'action',
			destination: 'dest',
			schemaVersion: schemaVersion,
		};

		const headersSpy = jest
			.spyOn(event, 'getHeaders')
			.mockReturnValueOnce(headers);

		const payload = event.payload();

		expect(payload).toStrictEqual({ headers, body });
		expect(headersSpy).toBeCalledTimes(1);
	});

	it('getBody() - should return body correctly', () => {
		const body = { text: 'message body' };
		const event = new Event('another.custom.action', body);

		const eventBody = event.getBody();

		expect(eventBody).toStrictEqual(body);
	});

	it('getBody() - should return body string correctly', () => {
		const stringBody = `{ "text": "a message body" }`;
		const event = new Event('another.custom.action', stringBody);

		const eventBody = event.getBody();

		expect(eventBody).toStrictEqual(JSON.parse(stringBody));
	});

	it('getName() - should return name correctly', () => {
		const body = { text: 'message body' };
		const name = 'another.great.action';
		const event = new Event(name, body);

		const eventName = event.getName();

		expect(eventName).toStrictEqual(name);
	});

	it('getBody() - should return body correctly', () => {
		const body = { text: 'message body' };
		const name = 'resource.origin.action.dest';

		const event = new Event(name, body);

		const eventHeaders = event.getHeaders();

		expect(eventHeaders).toStrictEqual({
			appName: Config.APP_NAME,
			resource: 'resource',
			origin: 'origin',
			action: 'action',
			destination: 'dest',
			schemaVersion: 1.0,
		});
	});

	describe('fixedEventName', () => {
		it('fixEventName() - should add suffix .all for event name', () => {
			const name = 'some.custom.action';

			const fixedEventName = Event.fixedEventName(name, 'all');

			expect(fixedEventName).toBe(`${name}.all`);
		});

		it('fixEventName() - should not add any suffix for event name', () => {
			const name = 'some.custom.action.dest';

			const fixedEventName = Event.fixedEventName(name, 'all');

			expect(fixedEventName).toBe(`${name}`);
		});

		it('fixEventName() - Should throw Missisng Attribute error due to event name pattern', () => {
			const name = 'some.action';

			expect(() => Event.fixedEventName(name, 'all')).toThrowError(
				new MissingAttributeError(INVALID_EVENT_NAME),
			);
		});
	});
});
