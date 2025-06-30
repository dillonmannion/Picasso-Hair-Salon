import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';

/**
 * Default API handlers for common endpoints
 */
const defaultHandlers = [
	// Auth endpoints
	http.post('/api/auth/login', async ({ request }) => {
		const body = await request.json();
		if (body.email === 'test@example.com' && body.password === 'password') {
			return HttpResponse.json({
				user: { id: '1', email: 'test@example.com', name: 'Test User' },
				token: 'test-token'
			});
		}
		return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
	}),
	
	http.post('/api/auth/logout', () => {
		return HttpResponse.json({ success: true });
	}),
	
	// Services endpoints
	http.get('/api/services', () => {
		return HttpResponse.json({
			services: [
				{ id: '1', name: 'Haircut', price: 30, duration: 30 },
				{ id: '2', name: 'Color', price: 80, duration: 120 }
			]
		});
	}),
	
	// Appointments endpoints
	http.get('/api/appointments', () => {
		return HttpResponse.json({
			appointments: []
		});
	}),
	
	http.post('/api/appointments', async ({ request }) => {
		const body = await request.json();
		return HttpResponse.json({
			appointment: { id: '1', ...body, status: 'confirmed' }
		});
	})
];

/**
 * Create and configure MSW server
 */
export const server = setupServer(...defaultHandlers);

/**
 * Start server before all tests
 */
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

/**
 * Reset handlers after each test
 */
afterEach(() => server.resetHandlers());

/**
 * Clean up after all tests
 */
afterAll(() => server.close());

/**
 * Helper to mock a specific API response
 * @param {string} method
 * @param {string} url
 * @param {any} response
 * @param {object} options
 */
export function mockAPI(method, url, response, options = {}) {
	const { status = 200, delay = 0, headers = {} } = options;
	
	server.use(
		http[method.toLowerCase()](url, async () => {
			if (delay) {
				await new Promise(resolve => setTimeout(resolve, delay));
			}
			
			if (response instanceof Error) {
				return HttpResponse.error();
			}
			
			return HttpResponse.json(response, { status, headers });
		})
	);
}

/**
 * Helper to mock API error
 * @param {string} method
 * @param {string} url
 * @param {number} status
 * @param {string} message
 */
export function mockAPIError(method, url, status = 500, message = 'Server error') {
	server.use(
		http[method.toLowerCase()](url, () => {
			return HttpResponse.json({ error: message }, { status });
		})
	);
}

/**
 * Helper to mock network failure
 * @param {string} method
 * @param {string} url
 */
export function mockNetworkError(method, url) {
	server.use(
		http[method.toLowerCase()](url, () => {
			return HttpResponse.error();
		})
	);
}

/**
 * Wait for a specific API call to be made
 * @param {string} method
 * @param {string} url
 * @param {number} timeout
 */
export async function waitForAPI(method, url, timeout = 1000) {
	const calls = [];
	
	server.events.on('request:match', (req) => {
		if (req.method === method.toUpperCase() && req.url.pathname === url) {
			calls.push(req);
		}
	});
	
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		if (calls.length > 0) {
			return calls[0];
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	
	throw new Error(`API call ${method} ${url} was not made within ${timeout}ms`);
}

/**
 * Get all requests made to a specific endpoint
 * @param {string} method
 * @param {string} url
 */
export function getAPICalls(method, url) {
	const calls = [];
	
	server.events.on('request:match', (req) => {
		if (req.method === method.toUpperCase() && req.url.pathname === url) {
			calls.push(req);
		}
	});
	
	return calls;
}