<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import type { PageData } from './$types';

	interface AvailabilityHours {
		start: string;
		end: string;
	}

	type DayAvailability = AvailabilityHours | null;

	interface StylistAvailability {
		[key: string]: DayAvailability;
	}

	let { data }: { data: PageData } = $props();

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	function formatSchedule(availability: StylistAvailability): string {
		const days = Object.entries(availability)
			.filter(([_, hours]) => hours !== null)
			.map(([day, hours]: [string, DayAvailability]) => {
				const dayName = day.charAt(0).toUpperCase() + day.slice(1, 3);
				if (hours) {
					return `${dayName}: ${hours.start}-${hours.end}`;
				}
				return '';
			})
			.filter(Boolean);
		return days.join(', ');
	}
</script>

<svelte:head>
	<title>Manage Stylists - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Stylists</h1>
			<p class="text-gray-600">Manage staff members, schedules, and specialties</p>
		</div>
		<Button>Add New Stylist</Button>
	</div>

	<!-- Stylists Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.stylists as stylist (stylist.id)}
			<Card>
				<CardHeader>
					<div class="flex items-center space-x-4">
						<Avatar class="h-16 w-16">
							<AvatarImage src={stylist.avatar_url} alt={stylist.name} />
							<AvatarFallback class="text-lg">{getInitials(stylist.name)}</AvatarFallback>
						</Avatar>
						<div class="flex-1">
							<CardTitle class="flex items-center justify-between">
								<span>{stylist.name}</span>
								{#if stylist.is_active}
									<span
										class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
									>
										Active
									</span>
								{:else}
									<span
										class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
									>
										Inactive
									</span>
								{/if}
							</CardTitle>
							<CardDescription>{stylist.bio}</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div class="space-y-4">
						<div>
							<h4 class="mb-2 text-sm font-medium text-gray-700">Specialties</h4>
							<div class="flex flex-wrap gap-1">
								{#each stylist.specialties ?? [] as specialty (specialty)}
									<span class="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
										{specialty}
									</span>
								{/each}
							</div>
						</div>

						<div>
							<h4 class="mb-1 text-sm font-medium text-gray-700">Schedule</h4>
							<p class="text-xs text-gray-600">
								{formatSchedule(stylist.availability as StylistAvailability)}
							</p>
						</div>

						<div class="flex space-x-2 pt-2">
							<Button variant="outline" size="sm" class="flex-1">Edit</Button>
							<Button variant="outline" size="sm" class="flex-1">Schedule</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Stylists Table -->
	<Card>
		<CardHeader>
			<CardTitle>Staff Overview</CardTitle>
			<CardDescription>Detailed view of all staff members with management options</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="px-4 py-3 text-left font-medium">Stylist</th>
							<th class="px-4 py-3 text-left font-medium">Specialties</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Working Days</th>
							<th class="px-4 py-3 text-left font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.stylists as stylist (stylist.id)}
							<tr class="border-b hover:bg-gray-50">
								<td class="px-4 py-3">
									<div class="flex items-center space-x-3">
										<Avatar class="h-10 w-10">
											<AvatarImage src={stylist.avatar_url} alt={stylist.name} />
											<AvatarFallback>{getInitials(stylist.name)}</AvatarFallback>
										</Avatar>
										<div>
											<p class="font-medium">{stylist.name}</p>
											<p class="max-w-xs truncate text-sm text-gray-600">{stylist.bio}</p>
										</div>
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-wrap gap-1">
										{#each (stylist.specialties ?? []).slice(0, 2) as specialty (specialty)}
											<span
												class="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
											>
												{specialty}
											</span>
										{/each}
										{#if (stylist.specialties ?? []).length > 2}
											<span class="text-xs text-gray-500"
												>+{(stylist.specialties ?? []).length - 2} more</span
											>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {stylist.is_active
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'}"
									>
										{stylist.is_active ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="text-sm text-gray-600">
										{Object.values(stylist.availability as StylistAvailability).filter(Boolean)
											.length} days
									</span>
								</td>
								<td class="px-4 py-3">
									<div class="flex space-x-2">
										<Button variant="outline" size="sm">Edit</Button>
										<Button variant="outline" size="sm">Schedule</Button>
										<Button variant="destructive" size="sm">Remove</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
