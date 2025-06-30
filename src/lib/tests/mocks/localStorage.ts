import { vi } from 'vitest';

export class LocalStorageMock implements Storage {
	private store: Record<string, string> = {};

	get length(): number {
		return Object.keys(this.store).length;
	}

	key(index: number): string | null {
		const keys = Object.keys(this.store);
		return keys[index] || null;
	}

	getItem(key: string): string | null {
		return this.store[key] || null;
	}

	setItem(key: string, value: string): void {
		this.store[key] = value.toString();
		this.dispatchStorageEvent(key, null, value);
	}

	removeItem(key: string): void {
		const oldValue = this.store[key];
		delete this.store[key];
		this.dispatchStorageEvent(key, oldValue, null);
	}

	clear(): void {
		this.store = {};
	}

	private dispatchStorageEvent(key: string, oldValue: string | null, newValue: string | null): void {
		const event = new StorageEvent('storage', {
			key,
			oldValue,
			newValue,
			storageArea: this,
			url: window.location.href
		});
		window.dispatchEvent(event);
	}
}

export function setupLocalStorageMock() {
	const localStorageMock = new LocalStorageMock();
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
		writable: true,
		configurable: true
	});
	return localStorageMock;
}

export function mockLocalStorage(initialData: Record<string, string> = {}) {
	const mock = setupLocalStorageMock();
	Object.entries(initialData).forEach(([key, value]) => {
		mock.setItem(key, value);
	});
	return mock;
}

export function spyOnLocalStorage() {
	const original = window.localStorage;
	const getItemSpy = vi.spyOn(original, 'getItem');
	const setItemSpy = vi.spyOn(original, 'setItem');
	const removeItemSpy = vi.spyOn(original, 'removeItem');
	const clearSpy = vi.spyOn(original, 'clear');

	return {
		getItem: getItemSpy,
		setItem: setItemSpy,
		removeItem: removeItemSpy,
		clear: clearSpy,
		restore: () => {
			getItemSpy.mockRestore();
			setItemSpy.mockRestore();
			removeItemSpy.mockRestore();
			clearSpy.mockRestore();
		}
	};
}

export function expectLocalStorageValue(key: string, expectedValue: string | null) {
	const actualValue = window.localStorage.getItem(key);
	expect(actualValue).toBe(expectedValue);
}

export function expectLocalStorageToContain(entries: Record<string, string>) {
	Object.entries(entries).forEach(([key, value]) => {
		expectLocalStorageValue(key, value);
	});
}