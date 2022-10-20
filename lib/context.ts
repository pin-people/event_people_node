export interface Context {
	success(eventMessage?: any): void;
	fail(eventMessage?: any): void;
	reject(eventMessage?: any): void;
}
