<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Alert from '$lib/components/ui/alert';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Search,
		TrendingUp,
		Clock,
		Smartphone,
		Monitor,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Lightbulb,
		BarChart3,
		Share2
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { seoMetrics, recommendations, recentChanges } = data;

	// Get badge variant based on score
	function getScoreBadge(score: number): 'default' | 'secondary' | 'destructive' {
		if (score >= 90) return 'default';
		if (score >= 70) return 'secondary';
		return 'destructive';
	}

	// Get priority badge variant
	function getPriorityBadge(priority: string): 'default' | 'secondary' | 'destructive' {
		switch (priority) {
			case 'high':
				return 'destructive';
			case 'medium':
				return 'secondary';
			default:
				return 'default';
		}
	}

	// Get recommendation icon
	function getRecommendationIcon(category: string) {
		switch (category) {
			case 'Critical':
				return AlertTriangle;
			case 'Performance':
				return TrendingUp;
			case 'Content':
				return Search;
			case 'Technical':
				return BarChart3;
			default:
				return Lightbulb;
		}
	}
</script>

<svelte:head>
	<title>{data.meta?.title || 'SEO Dashboard - Admin'}</title>
	<meta
		name="description"
		content={data.meta?.description ||
			'SEO dashboard for monitoring and improving website performance'}
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">SEO Dashboard</h1>
		<p class="text-gray-600">Monitor and optimize your website's search engine performance</p>
	</div>

	<!-- Overall Score -->
	<div class="mb-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Search class="h-5 w-5" />
					Overall SEO Score
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-6">
					<div class="text-center">
						<div class="text-primary text-4xl font-bold">{seoMetrics.overallScore}</div>
						<div class="text-sm text-gray-500">out of 100</div>
					</div>
					<div class="flex-1">
						<Progress value={seoMetrics.overallScore} class="h-3" />
					</div>
					<Badge variant={getScoreBadge(seoMetrics.overallScore)}>
						{seoMetrics.overallScore >= 90
							? 'Excellent'
							: seoMetrics.overallScore >= 70
								? 'Good'
								: 'Needs Work'}
					</Badge>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Metrics Grid -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- Page Speed -->
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="flex items-center gap-2 text-sm font-medium">
					<TrendingUp class="h-4 w-4" />
					Page Speed
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Monitor class="h-4 w-4 text-gray-500" />
						<span class="text-sm">Desktop</span>
					</div>
					<Badge variant={getScoreBadge(seoMetrics.pageSpeed.desktop)}>
						{seoMetrics.pageSpeed.desktop}
					</Badge>
				</div>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Smartphone class="h-4 w-4 text-gray-500" />
						<span class="text-sm">Mobile</span>
					</div>
					<Badge variant={getScoreBadge(seoMetrics.pageSpeed.mobile)}>
						{seoMetrics.pageSpeed.mobile}
					</Badge>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- SEO Health -->
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="flex items-center gap-2 text-sm font-medium">
					<CheckCircle class="h-4 w-4" />
					SEO Health
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each Object.entries(seoMetrics.seoHealth) as [key, value] (key)}
					<div class="flex items-center justify-between text-sm">
						<span class="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
						<Badge variant={getScoreBadge(value)}>
							{value}%
						</Badge>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<!-- Analytics -->
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="flex items-center gap-2 text-sm font-medium">
					<BarChart3 class="h-4 w-4" />
					Analytics
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span>Total Pages</span>
					<span class="font-medium">{seoMetrics.analytics.totalPages}</span>
				</div>
				<div class="flex items-center justify-between text-sm">
					<span>Indexed Pages</span>
					<span class="font-medium">{seoMetrics.analytics.indexedPages}</span>
				</div>
				<div class="flex items-center justify-between text-sm">
					<span>Avg Load Time</span>
					<span class="font-medium">{seoMetrics.analytics.averageLoadTime}s</span>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Social Media -->
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="flex items-center gap-2 text-sm font-medium">
					<Share2 class="h-4 w-4" />
					Social Media
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each Object.entries(seoMetrics.socialMedia) as [key, value] (key)}
					<div class="flex items-center justify-between text-sm">
						<span class="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
						<Badge variant={getScoreBadge(value)}>
							{value}%
						</Badge>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- SEO Recommendations -->
	<div class="mb-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Lightbulb class="h-5 w-5" />
					SEO Recommendations
				</Card.Title>
				<Card.Description>
					Actionable improvements to boost your search engine rankings
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Accordion.Root type="single" class="w-full">
					{#each recommendations as recommendation, index (recommendation.title)}
						{@const IconComponent = getRecommendationIcon(recommendation.category)}
						<Accordion.Item value="item-{index}">
							<Accordion.Trigger class="text-left">
								<div class="flex w-full items-center gap-3">
									<IconComponent class="h-4 w-4 flex-shrink-0" />
									<div class="flex-1">
										<div class="mb-1 flex items-center gap-2">
											<span class="font-medium">{recommendation.title}</span>
											<Badge variant={getPriorityBadge(recommendation.priority)} class="text-xs">
												{recommendation.priority}
											</Badge>
										</div>
										<p class="text-left text-sm text-gray-600">
											{recommendation.description}
										</p>
									</div>
								</div>
							</Accordion.Trigger>
							<Accordion.Content class="pt-4">
								<div class="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span class="font-medium text-gray-700">Category:</span>
										<span class="ml-2">{recommendation.category}</span>
									</div>
									<div>
										<span class="font-medium text-gray-700">Impact:</span>
										<span class="ml-2">{recommendation.estimated_impact}</span>
									</div>
									<div>
										<span class="font-medium text-gray-700">Difficulty:</span>
										<span class="ml-2">{recommendation.difficulty}</span>
									</div>
									<div>
										<span class="font-medium text-gray-700">Priority:</span>
										<Badge variant={getPriorityBadge(recommendation.priority)} class="ml-2 text-xs">
											{recommendation.priority}
										</Badge>
									</div>
								</div>
								<Separator class="my-4" />
								<Button size="sm" class="w-full sm:w-auto">Mark as Complete</Button>
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Recent Changes & Alerts -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Recent Changes -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Clock class="h-5 w-5" />
					Recent SEO Changes
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each recentChanges as change (change.date + change.page)}
						<div class="flex items-start gap-3">
							<div class="mt-1">
								{#if change.impact === 'positive'}
									<CheckCircle class="h-4 w-4 text-green-500" />
								{:else}
									<XCircle class="h-4 w-4 text-red-500" />
								{/if}
							</div>
							<div class="flex-1">
								<div class="text-sm font-medium">{change.page}</div>
								<div class="text-sm text-gray-600">{change.change}</div>
								<div class="text-xs text-gray-500">{change.date}</div>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Alerts & Issues -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<AlertTriangle class="h-5 w-5" />
					Critical Issues
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Alert.Root>
					<AlertTriangle class="h-4 w-4" />
					<Alert.Title>Schema Markup Missing</Alert.Title>
					<Alert.Description>
						Add structured data to help search engines better understand your content.
					</Alert.Description>
				</Alert.Root>

				<Alert.Root>
					<Smartphone class="h-4 w-4" />
					<Alert.Title>Mobile Speed Optimization</Alert.Title>
					<Alert.Description>
						Mobile page speed is below optimal. Consider image optimization and code splitting.
					</Alert.Description>
				</Alert.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
