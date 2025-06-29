<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PaymentStatus from '$lib/components/custom/PaymentStatus.svelte';

	const appointmentId = $page.url.searchParams.get('appointment_id');
	const canceled = $page.url.searchParams.get('canceled');

	onMount(() => {
		if (!appointmentId && !canceled) {
			// If no appointment ID or cancel flag, redirect to booking start
			void goto('/booking');
		}
	});
</script>

<PaymentStatus status="cancelled" {appointmentId} />
