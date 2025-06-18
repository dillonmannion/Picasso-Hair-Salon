<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import {
		Calendar,
		DollarSign,
		Users,
		Star,
		TrendingUp,
		Clock,
		CheckCircle,
		XCircle,
		AlertCircle
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Format currency
	function formatCurrency(amount: number): string {
		return `$${amount.toFixed(2)}`;
	}

	// Format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	// Get status badge variant
	function getStatusVariant(status: string) {
		switch (status) {
			case 'completed':
				return 'default';
			case 'confirmed':
				return 'secondary';
			case 'pending':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	// Get status icon
	function getStatusIcon(status: string) {
		switch (status) {
			case 'completed':
				return CheckCircle;
			case 'confirmed':
				return Clock;
			case 'pending':
				return AlertCircle;
			case 'cancelled':
				return XCircle;
			default:
				return AlertCircle;
		}
	}

	// Calculate percentage for status breakdown
	function getStatusPercentage(count: number): number {
		return data.analytics.totalAppointments > 0
			? (count / data.analytics.totalAppointments) * 100
			: 0;
	}
</script>

<div class="space-y-6">
	<!-- Analytics Cards -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Total Revenue -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Revenue</Card.Title>
				<DollarSign class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(data.analytics.totalRevenue)}</div>
				<p class="text-muted-foreground text-xs">
					<span class="flex items-center gap-1 text-green-600">
						<TrendingUp class="h-3 w-3" />
						+12.5% from last month
					</span>
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Total Appointments -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Appointments</Card.Title>
				<Calendar class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.analytics.totalAppointments}</div>
				<p class="text-muted-foreground text-xs">
					<span class="flex items-center gap-1 text-green-600">
						<TrendingUp class="h-3 w-3" />
						+8.1% from last month
					</span>
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Average Rating -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Average Rating</Card.Title>
				<Star class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.analytics.averageRating}/5</div>
				<p class="text-muted-foreground text-xs">
					Based on {data.analytics.totalReviews} reviews
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Active Stylists -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Stylists</Card.Title>
				<Users class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.analytics.totalStylists}</div>
				<p class="text-muted-foreground text-xs">
					{data.analytics.totalServices} services available
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts and Data -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Revenue Chart (Mock) -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Monthly Revenue</Card.Title>
				<Card.Description>Revenue overview for the last 6 months</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each data.monthlyRevenue as month (month.month)}
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">{month.month}</span>
							<span class="text-muted-foreground text-sm">{formatCurrency(month.revenue)}</span>
						</div>
						<Progress value={(month.revenue / 7000) * 100} class="h-2" />
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Appointment Status Breakdown -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Appointment Status</Card.Title>
				<Card.Description>Current appointment status distribution</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each Object.entries(data.appointmentsByStatus) as [status, count] (status)}
						{@const IconComponent = getStatusIcon(status)}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<IconComponent class="h-4 w-4" />
								<span class="text-sm font-medium capitalize">{status}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground text-sm">{count}</span>
								<Badge variant={getStatusVariant(status)} class="text-xs">
									{Math.round(getStatusPercentage(count))}%
								</Badge>
							</div>
						</div>
						<Progress value={getStatusPercentage(count)} class="h-2" />
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Recent Activity -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Recent Appointments</Card.Title>
			<Card.Description>Latest appointment bookings and updates</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.recentAppointments.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head>Time</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Service</Table.Head>
							<Table.Head class="text-right">Total</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.recentAppointments as appointment (appointment.id)}
							<Table.Row>
								<Table.Cell>
									{formatDate(appointment.appointment_date)}
								</Table.Cell>
								<Table.Cell>
									{appointment.appointment_time}
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(appointment.status || 'pending')}>
										{appointment.status || 'pending'}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{appointment.service_id}
								</Table.Cell>
								<Table.Cell class="text-right">
									{formatCurrency(parseFloat(appointment.total_price || '0'))}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="text-muted-foreground py-8 text-center">
					<Calendar class="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p>No recent appointments found</p>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			<Button href="/admin/appointments" variant="outline" class="w-full">
				View All Appointments
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
