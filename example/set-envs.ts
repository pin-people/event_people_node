export const setEnvs = () => {
	process.env.RABBIT_URL = 'amqp://admin:admin@127.0.0.1:5672';
	process.env.RABBIT_EVENT_PEOPLE_APP_NAME = 'event_people_node';
	process.env.RABBIT_EVENT_PEOPLE_VHOST = 'event_people';
	process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME = 'event_people';
};
