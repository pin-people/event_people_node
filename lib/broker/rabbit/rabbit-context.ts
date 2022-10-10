import { Context } from '../../context';

export class RabbitContext implements Context {
	success(): void {}
	fail(): void {}
	reject(): void {}
}
