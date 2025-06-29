/**
 * Utility functions for formatting dates, times, prices, and durations
 */

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string): string {
	return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

/**
 * Format a time string (HH:MM) to 12-hour format
 */
export function formatTime(timeStr: string): string {
	const [hours, minutes] = timeStr.split(':');
	const hour = Number.parseInt(hours ?? '0');
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
	return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format a number as USD currency
 */
export function formatPrice(price: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(price);
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} minutes`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (mins === 0) {
		return `${hours} hour${hours > 1 ? 's' : ''}`;
	}
	return `${hours} hour ${mins} minutes`;
}
