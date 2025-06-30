/**
 * User-friendly error messages for the appointment system
 * Following Gemini's suggestion for clear, non-technical error messages
 */

export const APPOINTMENT_ERRORS = {
	// Validation errors
	INVALID_DATE: 'Please select a valid appointment date.',
	INVALID_TIME: 'Please select a valid appointment time.',
	PAST_DATE: 'Appointments cannot be scheduled in the past.',

	// Cancellation errors
	CANCELLATION_TOO_LATE: 'This appointment cannot be cancelled less than 24 hours in advance.',
	ALREADY_CANCELLED: 'This appointment has already been cancelled.',
	CANNOT_CANCEL_COMPLETED: 'Completed appointments cannot be cancelled.',

	// Scheduling errors
	TIME_SLOT_UNAVAILABLE: 'This time slot is no longer available. Please select another time.',
	STYLIST_UNAVAILABLE: 'This stylist is not available at the selected time.',
	SERVICE_UNAVAILABLE: 'This service is no longer available.',
	DOUBLE_BOOKING: 'You already have an appointment scheduled at this time.',

	// Permission errors
	UNAUTHORIZED: 'You do not have permission to perform this action.',
	NOT_YOUR_APPOINTMENT: 'You can only manage your own appointments.',

	// Status errors
	INVALID_STATUS_TRANSITION: 'This appointment cannot be changed to the requested status.',
	APPOINTMENT_NOT_PENDING: 'Only pending appointments can be modified.',

	// General errors
	APPOINTMENT_NOT_FOUND: 'The requested appointment could not be found.',
	DATABASE_ERROR: 'An error occurred while processing your request. Please try again.',
	NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
	UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.'
} as const;

export const ADMIN_ERRORS = {
	// Additional admin-specific messages
	INVALID_FILTER: 'The selected filter options are invalid.',
	EXPORT_FAILED: 'Failed to export appointment data. Please try again.',
	BULK_ACTION_FAILED: 'Some appointments could not be updated. Please review and try again.'
} as const;

export const SUCCESS_MESSAGES = {
	// User success messages
	APPOINTMENT_BOOKED: 'Your appointment has been successfully booked!',
	APPOINTMENT_CANCELLED: 'Your appointment has been cancelled.',
	APPOINTMENT_RESCHEDULED: 'Your appointment has been rescheduled.',

	// Admin success messages
	APPOINTMENT_CONFIRMED: 'The appointment has been confirmed.',
	APPOINTMENT_UPDATED: 'The appointment has been updated.',
	BULK_UPDATE_SUCCESS: 'All selected appointments have been updated.'
} as const;

// Type helpers
export type AppointmentError = (typeof APPOINTMENT_ERRORS)[keyof typeof APPOINTMENT_ERRORS];
export type AdminError = (typeof ADMIN_ERRORS)[keyof typeof ADMIN_ERRORS];
export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES];

/**
 * Helper function to get a user-friendly error message
 * Falls back to a generic message if the error is not recognized
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		// Check if it's a known error message
		const message = error.message;
		const allErrors = { ...APPOINTMENT_ERRORS, ...ADMIN_ERRORS };

		// If the error message matches a known error, return it
		if (Object.values(allErrors).includes(message as any)) {
			return message;
		}

		// Check for specific database/network error patterns
		if (message.includes('fetch failed') || message.includes('network')) {
			return APPOINTMENT_ERRORS.NETWORK_ERROR;
		}

		if (message.includes('constraint') || message.includes('violates')) {
			return APPOINTMENT_ERRORS.TIME_SLOT_UNAVAILABLE;
		}
	}

	// Default fallback
	return APPOINTMENT_ERRORS.UNKNOWN_ERROR;
}
