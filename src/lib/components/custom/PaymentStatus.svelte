<script lang="ts">
	import { goto } from '$app/navigation';

	type PaymentStatusType = 'success' | 'cancelled' | 'error';

	interface Props {
		status: PaymentStatusType;
		appointmentId?: string | null;
		onTryAgain?: () => void;
		onViewAppointments?: () => void;
	}

	let { status, appointmentId = null, onTryAgain, onViewAppointments }: Props = $props();

	const statusConfig = {
		success: {
			icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
			iconColor: 'text-green-600',
			bgColor: 'bg-green-100',
			title: 'Payment Successful!',
			message: "Your appointment has been confirmed. We'll see you soon!"
		},
		cancelled: {
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			iconColor: 'text-yellow-600',
			bgColor: 'bg-yellow-100',
			title: 'Payment Cancelled',
			message: "Your payment was cancelled. Don't worry, your appointment is still reserved."
		},
		error: {
			icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
			iconColor: 'text-red-600',
			bgColor: 'bg-red-100',
			title: 'Payment Error',
			message: 'Something went wrong with your payment. Please try again.'
		}
	};

	const config = statusConfig[status];

	function handleTryAgain() {
		if (onTryAgain) {
			onTryAgain();
		} else if (appointmentId) {
			void goto(`/api/checkout?appointmentId=${appointmentId}`);
		} else {
			void goto('/booking');
		}
	}

	function handleViewAppointments() {
		if (onViewAppointments) {
			onViewAppointments();
		} else {
			void goto('/appointments');
		}
	}
</script>

<div class="space-y-6">
	<!-- Status Icon -->
	<div class="flex justify-center">
		<div class="flex h-24 w-24 items-center justify-center rounded-full {config.bgColor}">
			<svg
				class="h-12 w-12 {config.iconColor}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={config.icon} />
			</svg>
		</div>
	</div>

	<!-- Status Message -->
	<div class="text-center">
		<h2 class="text-3xl font-bold text-gray-900">{config.title}</h2>
		<p class="mt-2 text-lg text-gray-600">{config.message}</p>
	</div>

	<!-- Info Card for non-success states -->
	{#if status !== 'success'}
		<div class="rounded-lg border bg-gray-50 p-6">
			<h3 class="mb-3 text-lg font-semibold text-gray-900">What happens now?</h3>
			<ul class="space-y-2 text-sm text-gray-700">
				{#if status === 'cancelled'}
					<li class="flex items-start">
						<svg class="mt-0.5 mr-2 h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						Your appointment is still reserved for 15 minutes
					</li>
					<li class="flex items-start">
						<svg class="mt-0.5 mr-2 h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						You can try payment again or pay at the salon
					</li>
				{/if}
				<li class="flex items-start">
					<svg class="mt-0.5 mr-2 h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Contact us if you need assistance
				</li>
			</ul>
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
		{#if status === 'success'}
			<button
				type="button"
				onclick={handleViewAppointments}
				class="bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 font-medium text-white transition-all"
			>
				View My Appointments
			</button>
		{:else}
			<button
				type="button"
				onclick={handleTryAgain}
				class="bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 font-medium text-white transition-all"
			>
				Try Payment Again
			</button>
			<button
				type="button"
				onclick={handleViewAppointments}
				class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
			>
				View My Appointments
			</button>
		{/if}
	</div>
</div>
