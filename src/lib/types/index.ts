// Strict type utilities for enhanced type safety
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

// Replace all any with unknown or specific types
export type SafeEventHandler<T = unknown> = (event: T) => void | Promise<void>;

// Safe type guards
export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDefined<T>(value: T | undefined | null): value is T {
	return value !== undefined && value !== null;
}

// Type-safe error handling
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
	return { ok: true, value };
}

export function err<E = Error>(error: E): Result<never, E> {
	return { ok: false, error };
}

// Type-safe event types
export type FormSubmitEvent = Event & {
	currentTarget: EventTarget & HTMLFormElement;
};

export type InputChangeEvent = Event & {
	currentTarget: EventTarget & HTMLInputElement;
};

export type SelectChangeEvent = Event & {
	currentTarget: EventTarget & HTMLSelectElement;
};

// Utility type for strict function types
export type StrictFunction<Args extends readonly unknown[], Return> = (...args: Args) => Return;

// Non-nullable type helper
export type NonNullable<T> = T extends null | undefined ? never : T;

// Deep partial type for complex objects
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

// Type for async function results
export type AsyncResult<T> = Promise<Result<T>>;

// Helper for extracting promise type
export type Awaited<T> = T extends Promise<infer U> ? U : T;
