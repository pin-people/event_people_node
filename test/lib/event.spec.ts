import { Config, Event } from '../../lib';
import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from '../mock/constants';

describe('lib/event.ts', () => {
	beforeAll(() => {
		new Config(
			RABBIT_URL,
			RABBIT_EVENT_PEOPLE_VHOST,
			RABBIT_EVENT_PEOPLE_APP_NAME,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
		);
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

	it('fixName() - should add suffix .all for event name', () => {
		const name = 'some.custom.action';
		const event = new Event(name, {});

		event['fixName']();

		expect(event.getName()).toBe(`${name}.all`);
	});
});
