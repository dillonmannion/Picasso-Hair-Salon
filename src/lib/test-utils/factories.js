/**
 * Factory functions for generating test data
 */

let idCounter = 0;

/**
 * Generate unique ID for test data
 */
function generateId() {
	return `test-${++idCounter}`;
}

/**
 * Create a test user object
 * @param {Partial<User>} overrides
 */
export function createUser(overrides = {}) {
	return {
		id: generateId(),
		email: 'test@example.com',
		name: 'Test User',
		role: 'user',
		createdAt: new Date().toISOString(),
		...overrides
	};
}

/**
 * Create a test service object
 * @param {Partial<Service>} overrides
 */
export function createService(overrides = {}) {
	return {
		id: generateId(),
		name: 'Test Service',
		description: 'Test service description',
		price: 50,
		duration: 60,
		category: 'hair',
		active: true,
		...overrides
	};
}

/**
 * Create a test appointment object
 * @param {Partial<Appointment>} overrides
 */
export function createAppointment(overrides = {}) {
	return {
		id: generateId(),
		userId: generateId(),
		serviceId: generateId(),
		stylistId: generateId(),
		date: new Date().toISOString(),
		status: 'confirmed',
		notes: '',
		...overrides
	};
}

/**
 * Create a test form data object
 * @param {Partial<FormData>} overrides
 */
export function createFormData(overrides = {}) {
	return {
		name: 'John Doe',
		email: 'john@example.com',
		phone: '555-0123',
		message: 'Test message',
		...overrides
	};
}

/**
 * Create a test gallery image object
 * @param {Partial<GalleryImage>} overrides
 */
export function createGalleryImage(overrides = {}) {
	return {
		id: generateId(),
		url: 'https://via.placeholder.com/400x300',
		alt: 'Test image',
		category: 'haircuts',
		featured: false,
		order: 0,
		...overrides
	};
}

/**
 * Create a test review object
 * @param {Partial<Review>} overrides
 */
export function createReview(overrides = {}) {
	return {
		id: generateId(),
		userId: generateId(),
		serviceId: generateId(),
		rating: 5,
		comment: 'Great service!',
		createdAt: new Date().toISOString(),
		...overrides
	};
}

/**
 * Create a test notification object
 * @param {Partial<Notification>} overrides
 */
export function createNotification(overrides = {}) {
	return {
		id: generateId(),
		type: 'info',
		title: 'Test Notification',
		message: 'This is a test notification',
		duration: 5000,
		...overrides
	};
}

/**
 * Create test theme configuration
 * @param {Partial<Theme>} overrides
 */
export function createTheme(overrides = {}) {
	return {
		name: 'test-theme',
		colors: {
			primary: '#0070f3',
			secondary: '#ff0080',
			background: '#ffffff',
			foreground: '#000000',
			muted: '#666666',
			accent: '#f81ce5'
		},
		fonts: {
			body: 'system-ui, sans-serif',
			heading: 'system-ui, sans-serif',
			mono: 'monospace'
		},
		...overrides
	};
}

/**
 * Create an array of items using a factory function
 * @param {Function} factory
 * @param {number} count
 * @param {Function} modifier
 */
export function createMany(factory, count, modifier = (item, index) => item) {
	return Array.from({ length: count }, (_, index) => modifier(factory(), index));
}

/**
 * Reset factory state (useful between tests)
 */
export function resetFactories() {
	idCounter = 0;
}
