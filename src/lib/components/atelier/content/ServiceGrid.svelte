<script lang="ts">
	import { onMount } from 'svelte';

	interface Service {
		id: string | number;
		title: string;
		description: string;
		price?: string;
		duration?: string;
		image?: string;
		icon?: string;
		link?: string;
	}

	interface Props {
		services: Service[];
		columns?: 2 | 3 | 4;
		staggerDelay?: number;
		animateOnScroll?: boolean;
		gap?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		services,
		columns = 3,
		staggerDelay = 100,
		animateOnScroll = true,
		gap = 'md',
		class: className = ''
	}: Props = $props();

	let gridElement: HTMLElement;
	let isVisible = $state(false);
	let visibleItems = $state<Set<string | number>>(new Set());

	const columnClasses = {
		2: 'grid-cols-1 md:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
	};

	const gapClasses = {
		sm: 'gap-4',
		md: 'gap-6',
		lg: 'gap-8'
	};

	onMount(() => {
		if (!animateOnScroll) {
			isVisible = true;
			services.forEach((service) => visibleItems.add(service.id));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const id = entry.target.getAttribute('data-service-id');
						if (id) {
							visibleItems.add(id.includes('-') ? id : Number(id));
						}
						if (!isVisible) {
							isVisible = true;
						}
					}
				});
			},
			{
				threshold: 0.1,
				rootMargin: '50px'
			}
		);

		const items = gridElement.querySelectorAll('.atelier-service-card');
		items.forEach((item) => observer.observe(item));

		return () => {
			observer.disconnect();
		};
	});

	function getAnimationDelay(index: number): string {
		if (!animateOnScroll || !isVisible) return '0ms';
		return `${index * staggerDelay}ms`;
	}

	function handleKeyDown(event: KeyboardEvent, service: Service) {
		if (service.link && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			window.location.href = service.link;
		}
	}

	function handleServiceClick(service: Service) {
		if (service.link) {
			window.location.href = service.link;
		}
	}

	function handleServiceKeyDown(event: KeyboardEvent, service: Service) {
		if (service.link) {
			handleKeyDown(event, service);
		}
	}
</script>

<div
	bind:this={gridElement}
	class="atelier-service-grid grid {columnClasses[columns]} {gapClasses[gap]} {className}"
	role="region"
	aria-label="Services"
>
	{#each services as service, index (service.id)}
		<article
			class="atelier-service-card"
			class:atelier-service-card--visible={visibleItems.has(service.id)}
			class:atelier-service-card--clickable={!!service.link}
			style:animation-delay={getAnimationDelay(index)}
			data-service-id={service.id}
			role={service.link ? 'button' : undefined}
			tabindex={service.link ? 0 : undefined}
			onkeydown={(e) => handleServiceKeyDown(e, service)}
			onclick={() => handleServiceClick(service)}
		>
			{#if service.image}
				<div class="atelier-service-card__image-container">
					<img
						src={service.image}
						alt={service.title}
						class="atelier-service-card__image"
						loading="lazy"
					/>
				</div>
			{:else if service.icon}
				<div class="atelier-service-card__icon">
					{service.icon}
				</div>
			{/if}

			<div class="atelier-service-card__content">
				<h3 class="atelier-service-card__title">
					{service.title}
				</h3>

				<p class="atelier-service-card__description">
					{service.description}
				</p>

				{#if service.price || service.duration}
					<div class="atelier-service-card__meta">
						{#if service.price}
							<span class="atelier-service-card__price">
								{service.price}
							</span>
						{/if}
						{#if service.duration}
							<span class="atelier-service-card__duration">
								{service.duration}
							</span>
						{/if}
					</div>
				{/if}

				{#if service.link}
					<span class="atelier-service-card__link-indicator" aria-hidden="true"> → </span>
				{/if}
			</div>
		</article>
	{/each}
</div>

<style>
	.atelier-service-grid {
		width: 100%;
	}

	.atelier-service-card {
		position: relative;
		background: var(--atelier-card-bg, white);
		border-radius: var(--atelier-radius-lg, 12px);
		overflow: hidden;
		box-shadow: var(--atelier-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		transform: translateY(30px);

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-card-bg-dark, #1a1a1a);
			box-shadow: var(--atelier-shadow-sm-dark, 0 1px 3px rgba(0, 0, 0, 0.3));
		}

		@media (prefers-reduced-motion: reduce) {
			transition: none;
			opacity: 1;
			transform: none;
		}
	}

	.atelier-service-card--visible {
		animation: atelier-service-fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;

		@media (prefers-reduced-motion: reduce) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	.atelier-service-card--clickable {
		cursor: pointer;

		&:hover {
			transform: translateY(-4px);
			box-shadow: var(--atelier-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15));

			@media (prefers-color-scheme: dark) {
				box-shadow: var(--atelier-shadow-md-dark, 0 4px 12px rgba(0, 0, 0, 0.4));
			}
		}

		&:focus {
			outline: 2px solid var(--atelier-focus-ring, #3b82f6);
			outline-offset: 2px;
		}

		&:active {
			transform: translateY(-2px);
		}
	}

	.atelier-service-card__image-container {
		position: relative;
		width: 100%;
		padding-top: 66.67%; /* 3:2 aspect ratio */
		overflow: hidden;
		background: var(--atelier-bg-muted, #f5f5f5);

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-bg-muted-dark, #2a2a2a);
		}
	}

	.atelier-service-card__image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

		.atelier-service-card--clickable:hover & {
			transform: scale(1.05);
		}
	}

	.atelier-service-card__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 60px;
		margin: 2rem 2rem 1rem;
		font-size: 2rem;
		color: var(--atelier-primary, #3b82f6);
		background: var(--atelier-primary-light, rgba(59, 130, 246, 0.1));
		border-radius: var(--atelier-radius-md, 8px);

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-primary-dark, rgba(59, 130, 246, 0.2));
		}
	}

	.atelier-service-card__content {
		padding: 1.5rem;

		.atelier-service-card__image-container + & {
			padding-top: 1.25rem;
		}
	}

	.atelier-service-card__title {
		font-size: 1.25rem;
		font-weight: 500;
		font-family: var(--atelier-font-display, var(--atelier-font-primary, system-ui));
		letter-spacing: -0.01em;
		line-height: 1.3;
		margin: 0 0 0.75rem;
		color: var(--atelier-text-primary, #1a1a1a);

		@media (prefers-color-scheme: dark) {
			color: var(--atelier-text-primary-dark, #f5f5f5);
		}
	}

	.atelier-service-card__description {
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0 0 1rem;
		color: var(--atelier-text-secondary, #666);

		@media (prefers-color-scheme: dark) {
			color: var(--atelier-text-secondary-dark, #a0a0a0);
		}
	}

	.atelier-service-card__meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.875rem;
		color: var(--atelier-text-muted, #999);

		@media (prefers-color-scheme: dark) {
			color: var(--atelier-text-muted-dark, #888);
		}
	}

	.atelier-service-card__price {
		font-weight: 600;
		color: var(--atelier-primary, #3b82f6);
		font-size: 1rem;
	}

	.atelier-service-card__duration {
		display: flex;
		align-items: center;
		gap: 0.25rem;

		&::before {
			content: '•';
			color: var(--atelier-text-muted, #999);
		}
	}

	.atelier-service-card__link-indicator {
		position: absolute;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--atelier-primary, #3b82f6);
		color: white;
		border-radius: 50%;
		font-size: 1.125rem;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		.atelier-service-card--clickable:hover & {
			transform: translateX(4px);
		}
	}

	@keyframes atelier-service-fade-up {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
