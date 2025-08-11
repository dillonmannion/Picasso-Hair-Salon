import type { Database } from '$lib/types/database.types';

type Service = Database['public']['Tables']['services']['Row'];
type Stylist = Database['public']['Tables']['stylists']['Row'];

export class BookingState {
	service = $state<Service | null>(null);
	stylist = $state<Stylist | null>(null);
	date = $state<Date | null>(null);
	time = $state<string | null>(null);

	// Derived state for validation
	isValid = $derived(!!(this.service && this.stylist && this.date && this.time));

	// Derived state for summary
	summary = $derived(() => ({
		service: this.service,
		stylist: this.stylist,
		date: this.date,
		time: this.time,
		totalPrice: this.service?.price || '0',
		duration: this.service?.duration || 0
	}));

	// Methods for state management
	setService(service: Service | null) {
		this.service = service;
	}

	setStylist(stylist: Stylist | null) {
		this.stylist = stylist;
	}

	setDate(date: Date | null) {
		this.date = date;
	}

	setTime(time: string | null) {
		this.time = time;
	}

	reset() {
		this.service = null;
		this.stylist = null;
		this.date = null;
		this.time = null;
	}

	// Create booking object for API
	getBookingData() {
		if (!this.isValid) {
			throw new Error('Booking state is not valid');
		}

		return {
			service_id: this.service!.id,
			stylist_id: this.stylist!.id,
			appointment_date: this.date!.toISOString().split('T')[0],
			appointment_time: this.time!,
			status: 'pending' as const,
			total_price: this.service!.price,
			duration: this.service!.duration
		};
	}
}

// Create singleton instance
export const bookingState = new BookingState();

// Export convenience functions
export function useBookingState() {
	return bookingState;
}
