<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { formatPrice, formatDuration } from '$lib/utils/formatters';
	import type { Database } from '$lib/types/database.types';

	type Service = Database['public']['Tables']['services']['Row'];

	interface Props {
		service: Service;
		isAdmin?: boolean;
		onEdit?: (service: Service) => void;
		onDelete?: (service: Service) => void;
		onBooking?: (service: Service) => void;
	}

	let { service, isAdmin = false, onEdit, onDelete, onBooking }: Props = $props();
</script>

<Card class="{isAdmin ? 'relative' : ''} transition-shadow duration-300 hover:shadow-lg">
	{#if isAdmin}
		<div class="absolute top-2 right-2">
			<span
				class="inline-flex rounded-full px-2 py-1 text-xs font-medium
				{service.is_active
					? 'bg-luxe-cream-200 text-luxe-burgundy-700'
					: 'bg-luxe-burgundy-100 text-luxe-burgundy-800'}"
			>
				{service.is_active ? 'Active' : 'Inactive'}
			</span>
		</div>
	{/if}

	<CardHeader class={isAdmin ? '' : 'pb-4'}>
		<CardTitle class="flex items-center justify-between">
			<span>{service.name}</span>
			<span
				class={isAdmin ? 'text-lg font-bold text-green-600' : 'text-primary text-2xl font-bold'}
			>
				{formatPrice(Number(service.price))}
			</span>
		</CardTitle>
		<CardDescription class={isAdmin ? '' : 'text-base'}>{service.description}</CardDescription>
	</CardHeader>

	<CardContent>
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div class="flex flex-col">
					<span class="text-gray-600">Duration</span>
					<span class="font-medium">{formatDuration(service.duration)}</span>
				</div>

				<div class="flex flex-col">
					<span class="text-gray-600">Category</span>
					<span class="font-medium">{service.category}</span>
				</div>
			</div>

			{#if isAdmin}
				<div class="flex gap-2">
					{#if onEdit}
						<Button variant="outline" size="sm" class="flex-1" onclick={() => onEdit(service)}>
							Edit
						</Button>
					{/if}
					{#if onDelete}
						<Button
							variant="destructive"
							size="sm"
							class="flex-1"
							onclick={() => onDelete(service)}
						>
							Delete
						</Button>
					{/if}
				</div>
			{:else if onBooking}
				<Button class="w-full" size="lg" onclick={() => onBooking(service)}>
					Book Appointment
				</Button>
			{:else}
				<Button class="w-full" size="lg" href="/appointments?service={service.id}">
					Book Appointment
				</Button>
			{/if}
		</div>
	</CardContent>
</Card>
