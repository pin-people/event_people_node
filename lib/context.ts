export interface Context {
	success(): void;
	fail(): void;
	reject(): void;
}
