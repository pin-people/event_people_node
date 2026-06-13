# EventPeople

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/pin-people/event_people_node/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/pin-people/event_people_node/tree/main)

EventPeople is a tool to simplify the communication of event based services. It is an based on the [EventBus](https://github.com/EmpregoLigado/event_bus_rb) gem.

The main idea is to provide a tool that can emit or consume events based on its names, the event name has 4 words (`resource.origin.action.destination`) which defines some important info about what kind of event it is, where it comes from and who is eligible to consume it:

- **resource:** Defines which resource this event is related like a `user`, a `product`, `company` or anything that you want;
- **origin:** Defines the name of the system which emitted the event;
- **action:** What action is made on the resource like `create`, `delete`, `update`, etc. PS: _It is recommended to use the Simple Present tense for actions_;
- **destination (Optional):** This word is optional and if not provided EventPeople will add a `.all` to the end of the event name. It defines which service should consume the event being emitted, so if it is defined and there is a service whith the given name only this service will receive it. It is very helpful when you need to re-emit some events. Also if it is `.all` all services will receive it.

As of today EventPeople uses RabbitMQ as its datasource, but there are plans to add support for other Brokers in the future.

## Installation

Add this line to your application's `package.json`:

```console
yarn add event_people
```

or

```yaml
  "Dependencies": {
    ...
    "event_people": "^1.0.0"
    ...
  }
```

Add then run this command to install dependencies:

```console
yarn install

```

And set config vars:

```bash
export RABBIT_URL='amqp://guest:guest@localhost:5672'
export RABBIT_EVENT_PEOPLE_APP_NAME='service_name'
export RABBIT_EVENT_PEOPLE_VHOST='event_people'
export RABBIT_EVENT_PEOPLE_TOPIC_NAME='event_people'
```

or directly in JavaScript/TypeScript:

```javascript
process.env.RABBIT_URL = 'amqp://guest:guest@localhost:5672';
process.env.RABBIT_EVENT_PEOPLE_APP_NAME = 'service_name';
process.env.RABBIT_EVENT_PEOPLE_VHOST = 'event_people';
process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME = 'event_people';
```

**Note:** `RABBIT_EVENT_PEOPLE_MAX_RETRIES` and `RABBIT_EVENT_PEOPLE_RETRY_TTL_MS` env vars are no longer supported (removed in v1.2.0). Use `Config.configure()` or per-listener class attributes instead (see Retry section below).

## Usage

### Events

The main component of `EventPeople` is the `Event` class which wraps all the logic of an event and whenever you receive or want to send an event you will use it.

It has 2 attributes `name` and `payload`:

- **name:** The name must follow our conventions, being it 3 (`resource.origin.action`) or 4 words (`resource.origin.action.destination`);
- **payload:** It is the body of the massage, it should be a Hash object for simplicity and flexibility.

```typescript
import { Event } from 'event_people';

new Config();

const event_name = 'user.users.create';
const body = { id: 42, name: 'John Doe', age: 35 };
const event = new Event(event_name, body);
```

There are 3 main interfaces to use `EventPeople` on your project:

- Calling `eventPeople.Emitter.trigger(event: Event)` inside your project;
- Calling `eventPeople.Listener.on(event_name: String)` inside your project;
- Or extending `eventPeople.BaseListener` and use it as a daemon.

### Using the Emitter

You can emit events on your project passing an `eventPeople.Event` instance to the `eventPeople.Emitter.trigger` method. Doing this other services that are subscribed to these events will receive it.

```typescript
import { Config, Emitter, Event } from 'event_people';

new Config();

const event_name = 'receipt.payments.pay.users';
const body = { amount: 350.76 };
const event = new Event(event_name, body);

Emitter.trigger(event);

// Don't forget to close the connection!!!
Config.broker.closeConnection();
```

[See more details](https://github.com/pin-people/event_people_node/blob/master/examples/emitter.rb)

### Listeners

You can subscribe to events based on patterns for the event names you want to consume or you can use the full name of the event to consume single events.

We follow the RabbitMQ pattern matching model, so given each word of the event name is separated by a dot (`.`), you can use the following symbols:

- `* (star):` to match exactly one word. Example `resource.*.*.all`;
- `# (hash):` to match zero or more words. Example `resource.#.all`.

Other important aspect of event consumming is the result of the processing we provide 3 methods so you can inform the Broker what to do with the event next:

- `success:` should be called when the event was processed successfuly and the can be discarded;
- `fail:` should be called when an error ocurred processing the event and the message should be requeued;
- `reject:` should be called whenever a message should be discarded without being processed.

Given you want to consume a single event inside your project you can use the `eventPeople.Listener.on` method. It consumes a single event, given there are events available to be consumed with the given name pattern.

```typescript
import { Config, Context, Event, Listener } from 'event_people';

// 3 words event names will be replaced by its 4 word wildcard
// counterpart: 'payment.payments.pay.all'
const event_name = 'payment.payments.pay';

new Config();

Listener.on(event_name, (event: Event, context: Context) => {
	console.log('');
	console.log(`  - Received the "${event.name}" message from ${event.origin}:`);
	console.log(`     Message: ${event.body}`);
	console.log('');
	context.success();
});

Config.broker.closeConnection();
```

You can also receive all available messages using a loop:

```typescript
import { Config, Context, Event, Listener } from 'event_people';

const event_name = 'payment.payments.pay.all';
let has_events = true;

while (has_events) {
	has_events = false;

	await Listener.on('SOME_EVENT', (event: Event, context: Context) => {
		has_events = true;
		console.log('');
		console.log(
			`  - Received the "${event.name}" message from ${event.origin}:`,
		);
		console.log(`     Message: ${event.body}`);
		console.log('');
		context.success();
	});
}

Config.broker.closeConnection();
```

[See more details](https://github.com/pin-people/event_people_node/blob/master/examples/listener.rb)

#### Multiple events routing

If your project needs to handle lots of events you can extend `eventPeople.BaseListener` class to bind how many events you need to instance methods, so whenever an event is received the method will be called automatically.

```typescript
import { Event, BaseListener } from 'event_people';

class CustomEventListener extends BaseListener {
	pay(event: Event): void {
		console.log(
			`Paid #{event.body['amount']} for #{event.body['name']} ~> #{event.name}`,
		);

		this.success();
	}

	receive(event: Event): void {
		if (event.body.amount > 500) {
			console.log(
				`Received ${event.body['amount']} from ${event.body['name']} ~> ${event.name}`,
			);
		} else {
			console.log('[consumer] Got SKIPPED message');
			return this.reject();
		}

		this.success();
	}

	privateChannel(event: Event): void {
		console.log(
			`[consumer] Got a private message: "${event.body['message']}" ~> ${event.name}`,
		);

		this.success();
	}
}

new Config();

CustomEventListener.bindEvent('resource.custom.pay', this.pay);
CustomEventListener.bindEvent('resource.custom.receive', this.receive);
CustomEventListener.bindEvent(
	'resource.custom.private.service',
	this.privateChannel,
);
```

[See more details](https://github.com/pin-people/event_people_node/blob/master/examples/daemon.rb)

#### Creating a Daemon

If you have the need to create a deamon to consume messages on background you can use the `eventPeople.Daemon.start` method to do so with ease. Just remember to define or import all the event bindings before starting the daemon.

```typescript
import { Daemon, Event, BaseListener } from 'event_people';

class CustomEventListener extends BaseListener {
	pay(event: Event): void {
		console.log(
			`Paid ${event.body.amount} for ${event.body.name} ~> ${event.name}`,
		);

		this.success();
	}

	receive(event: Event): void {
		if (event.body.amount > 500) {
			console.log(
				`Received ${event.body.amount} from ${event.body.name} ~> ${event.name}`,
			);
		} else {
			console.log('[consumer] Got SKIPPED message');

			return this.reject();
		}

		this.success();
	}

	private_channel(event: Event): void {
		console.log(
			`[consumer] Got a private message: "${event.body.message}" ~> ${event.name}`,
		);

		this.success();
	}
}

CustomEventListener.bindEvent('resource.custom.pay', this.pay);
CustomEventListener.bindEvent('resource.custom.receive', this.receive);
CustomEventListener.bindEvent(
	'resource.custom.private.service',
	this.privateChannel,
);

new Config();

console.log('****************** Daemon Ready ******************');

Daemon.start();
```

[See more details](https://github.com/pin-people/event_people_node/blob/master/examples/daemon.rb)

## Retry and Dead Letter Queue (DLQ)

### Configuring retry behavior

Retry settings are configured via code — **not** environment variables.

**Global defaults (optional):**

```typescript
import { Config } from 'event_people';

Config.configure({
  maxAttempts: 5,       // default: 3
  initialDelay: 2000,   // base delay in ms; default: 1000
  delayStrategy: 'exponential', // 'exponential' or 'fixed'; default: 'exponential'
  dlqName: 'my_dlq',   // default: '{appName}_dlq'
});
```

When `Config.configure()` is not called, hardcoded defaults apply (`maxAttempts=3`, `initialDelay=1000ms`, `delayStrategy='exponential'`).

**Per-listener overrides (BaseListener subclasses):**

```typescript
import { BaseListener } from 'event_people';

class OrderListener extends BaseListener {
  static maxAttempts = 5;         // overrides Config.maxAttempts for this listener
  static initialDelay = 2000;     // overrides Config.initialDelay
  static delayStrategy = 'fixed'; // overrides Config.delayStrategy
  static dlqName = 'orders_dlq';  // overrides Config.dlqName

  handleOrder(event: Event): void {
    // ...
    this.success();
  }
}
```

### How it works

On `context.fail()`:

- If retries remain → message published to `{queue}_retry` with backoff delay (per-message TTL), then acked
- If retries exhausted → nacked to DLQ via RabbitMQ DLX (nack with requeue=false)
- If publish to retry queue fails (broker error) → nacked to DLQ (never requeued without retry increment)

On `context.reject()` → nacked directly to DLQ (no retries)

**Delay strategies:**

- `exponential` (default): `min(initialDelay × 5^retryCount, 600000)` ms
- `fixed`: constant `initialDelay` ms

### Queue topology (auto-created on subscribe)

| Queue/Exchange | Name | Purpose |
|---|---|---|
| Exchange (DLX) | `{appName}_dlx` | Fanout, receives dead-lettered messages |
| DLQ | `{appName}_dlq` | Final resting place for failed messages |
| Retry queue | `{queue_name}_retry` | Holds messages with per-message TTL until backoff expires |

### Usage

```typescript
import { Listener, Event, Context } from 'event_people';

function handleOrder(event: Event, context: Context): void {
  console.log(`Attempt ${event.retryCount + 1} of ${context.maxRetries}`);

  if (isInvalid(event)) {
    context.reject(); // → DLQ immediately, no retries
    return;
  }

  try {
    process(event);
    context.success();
  } catch (err) {
    if (context.isLastRetry) {
      console.log('Final attempt failed, sending to DLQ');
    }
    context.fail(); // → retry queue (or DLQ if exhausted)
  }
}

// Retry config comes from Config.configure() or per-listener class attributes (v1.2.0)
Listener.on('order.service.created', handleOrder);
Listener.on('user.service.updated', handleOrder);
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `bin/test` to run the tests.

To install this module onto your local machine, run `npm install -g`.

## Contributing

- Fork it
- Create your feature branch (`git checkout -b my-new-feature`)
- Commit your changes (`git commit -am 'Add some feature'`)
- Push to the branch (`git push origin my-new-feature`)
- Create a new Pull Request

## License

The module is available as open source under the terms of the [LGPL 3.0 License](https://www.gnu.org/licenses/lgpl-3.0.en.html).
