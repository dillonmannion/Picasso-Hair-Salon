<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PaymentStatus from '$lib/components/custom/PaymentStatus.svelte';

	const appointmentId = $derived($page.url.searchParams.get('appointment_id'));
	const canceled = $derived($page.url.searchParams.get('canceled'));

	$effect(() => {
		if (!appointmentId && !canceled) {
			void goto('/booking');
		}
	});
</script>

<PaymentStatus status="cancelled" {appointmentId} />
