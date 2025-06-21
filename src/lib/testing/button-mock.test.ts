import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import {
	render,
	getNavigationMocks,
	createMockHandler,
	expectButtonState
} from './button-test-utils';

// Simple mock button component for testing
const MockButton = {
	$$prop_def: {},
	$$events_def: {},
	$$slot_def: {}
};

describe('Button Testing Utilities', () => {
	test('navigation mocks work correctly', () => {
		const { goto, pushState } = getNavigationMocks();
		
		expect(goto).toBeDefined();
		expect(pushState).toBeDefined();
		expect(vi.isMockFunction(goto)).toBe(true);
		expect(vi.isMockFunction(pushState)).toBe(true);
	});

	test('createMockHandler creates a function that prevents default', () => {
		const handler = createMockHandler();
		const mockEvent = {
			preventDefault: vi.fn()
		};
		
		handler(mockEvent as any);
		
		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(handler).toHaveBeenCalledWith(mockEvent);
	});

	test('navigation mock can be called and verified', async () => {
		const { goto } = getNavigationMocks();
		goto.mockClear();
		
		await goto('/test-route');
		
		expect(goto).toHaveBeenCalledWith('/test-route');
		expect(goto).toHaveBeenCalledTimes(1);
	});

	test('multiple navigation calls are tracked', async () => {
		const { goto } = getNavigationMocks();
		goto.mockClear();
		
		await goto('/route1');
		await goto('/route2');
		await goto('/route3');
		
		expect(goto).toHaveBeenCalledTimes(3);
		expect(goto).toHaveBeenNthCalledWith(1, '/route1');
		expect(goto).toHaveBeenNthCalledWith(2, '/route2');
		expect(goto).toHaveBeenNthCalledWith(3, '/route3');
	});
});