import { describe, test, expect } from 'vitest';

describe('Simple Test', () => {
	test('basic math works', () => {
		expect(2 + 2).toBe(4);
	});

	test('button test utilities are importable', async () => {
		const utils = await import('./button-test-utils');
		expect(utils.render).toBeDefined();
		expect(utils.createMockHandler).toBeDefined();
		expect(utils.getNavigationMocks).toBeDefined();
	});
});