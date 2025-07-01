<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface MenuItem {
		label: string;
		href: string;
		target?: string;
	}

	interface Props {
		logo?: Snippet | string;
		menuItems?: MenuItem[];
		sticky?: boolean;
		hideOnScroll?: boolean;
		blurOnScroll?: boolean;
		mobileBreakpoint?: number;
		class?: string;
	}

	let {
		logo,
		menuItems = [],
		sticky = true,
		hideOnScroll = true,
		blurOnScroll = true,
		mobileBreakpoint = 768,
		class: className = ''
	}: Props = $props();

	let scrollY = $state(0);
	let lastScrollY = $state(0);
	let isHidden = $state(false);
	let isScrolled = $state(false);
	let isMobileMenuOpen = $state(false);
	let headerElement: HTMLElement;

	let rafId: number;
	let scrollTimeout: ReturnType<typeof setTimeout>;

	function handleScroll() {
		if (rafId) return;

		rafId = requestAnimationFrame(() => {
			scrollY = window.scrollY;
			isScrolled = scrollY > 20;

			if (hideOnScroll && scrollY > 100) {
				isHidden = scrollY > lastScrollY && scrollY - lastScrollY > 10;
			}

			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				lastScrollY = scrollY;
			}, 100);

			rafId = 0;
		});
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
		document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
		document.body.style.overflow = '';
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (rafId) cancelAnimationFrame(rafId);
			clearTimeout(scrollTimeout);
			document.body.style.overflow = '';
		};
	});

	$effect(() => {
		const handleResize = () => {
			if (window.innerWidth > mobileBreakpoint && isMobileMenuOpen) {
				closeMobileMenu();
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<header
	bind:this={headerElement}
	class="atelier-header {className}"
	class:atelier-header--sticky={sticky}
	class:atelier-header--hidden={isHidden}
	class:atelier-header--scrolled={isScrolled}
	class:atelier-header--blur={blurOnScroll && isScrolled}
>
	<nav class="atelier-header__nav" aria-label="Main navigation">
		<div class="atelier-header__container">
			<div class="atelier-header__logo">
				{#if typeof logo === 'string'}
					<a href="/" aria-label="Home">
						<span class="atelier-header__logo-text">{logo}</span>
					</a>
				{:else if logo}
					<a href="/" aria-label="Home">
						{@render logo()}
					</a>
				{/if}
			</div>

			<ul class="atelier-header__menu">
				{#each menuItems as item (item.href)}
					<li class="atelier-header__menu-item">
						<a
							href={item.href}
							target={item.target}
							class="atelier-header__menu-link"
							onclick={() => closeMobileMenu()}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>

			<button
				class="atelier-header__mobile-toggle"
				onclick={toggleMobileMenu}
				aria-expanded={isMobileMenuOpen}
				aria-label="Toggle navigation menu"
			>
				<span class="atelier-header__mobile-toggle-icon" class:active={isMobileMenuOpen}>
					<span></span>
					<span></span>
					<span></span>
				</span>
			</button>
		</div>
	</nav>

	<div
		class="atelier-header__mobile-menu"
		class:atelier-header__mobile-menu--open={isMobileMenuOpen}
		aria-hidden={!isMobileMenuOpen}
	>
		<ul class="atelier-header__mobile-menu-list">
			{#each menuItems as item (item.href)}
				<li class="atelier-header__mobile-menu-item">
					<a
						href={item.href}
						target={item.target}
						class="atelier-header__mobile-menu-link"
						onclick={() => closeMobileMenu()}
						tabindex={isMobileMenuOpen ? 0 : -1}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</header>

<style>
	:global(:root) {
		--atelier-header-height: 80px;
		--atelier-header-mobile-height: 64px;
		--atelier-header-bg: rgba(255, 255, 255, 0.95);
		--atelier-header-bg-dark: rgba(15, 15, 15, 0.95);
		--atelier-header-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		--atelier-header-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.atelier-header {
		position: relative;
		width: 100%;
		height: var(--atelier-header-height);
		background: var(--atelier-header-bg);
		transition: var(--atelier-header-transition);
		z-index: 100;

		@media (max-width: 768px) {
			height: var(--atelier-header-mobile-height);
		}

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-header-bg-dark);
		}
	}

	.atelier-header--sticky {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
	}

	.atelier-header--hidden {
		transform: translateY(-100%);
	}

	.atelier-header--scrolled {
		box-shadow: var(--atelier-header-shadow);
	}

	.atelier-header--blur {
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.atelier-header__nav {
		height: 100%;
		padding: 0 2rem;

		@media (max-width: 768px) {
			padding: 0 1rem;
		}
	}

	.atelier-header__container {
		max-width: 1200px;
		height: 100%;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.atelier-header__logo {
		flex-shrink: 0;

		a {
			text-decoration: none;
			color: inherit;
			display: flex;
			align-items: center;
		}
	}

	.atelier-header__logo-text {
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.02em;
		font-family: var(--atelier-font-display, var(--atelier-font-primary, system-ui));
	}

	.atelier-header__menu {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		list-style: none;
		margin: 0;
		padding: 0;

		@media (max-width: 768px) {
			display: none;
		}
	}

	.atelier-header__menu-link {
		text-decoration: none;
		color: inherit;
		font-size: 0.95rem;
		font-weight: 450;
		letter-spacing: 0.01em;
		position: relative;
		transition: opacity 0.2s ease;

		&:hover {
			opacity: 0.7;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: -4px;
			left: 0;
			width: 0;
			height: 1px;
			background: currentColor;
			transition: width 0.3s ease;
		}

		&:hover::after {
			width: 100%;
		}
	}

	.atelier-header__mobile-toggle {
		display: none;
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;

		@media (max-width: 768px) {
			display: block;
		}
	}

	.atelier-header__mobile-toggle-icon {
		display: block;
		width: 24px;
		height: 18px;
		position: relative;

		span {
			position: absolute;
			left: 0;
			width: 100%;
			height: 2px;
			background: currentColor;
			transition: var(--atelier-header-transition);
			transform-origin: center;

			&:nth-child(1) {
				top: 0;
			}

			&:nth-child(2) {
				top: 50%;
				transform: translateY(-50%);
			}

			&:nth-child(3) {
				bottom: 0;
			}
		}

		&.active {
			span:nth-child(1) {
				top: 50%;
				transform: translateY(-50%) rotate(45deg);
			}

			span:nth-child(2) {
				opacity: 0;
			}

			span:nth-child(3) {
				bottom: 50%;
				transform: translateY(50%) rotate(-45deg);
			}
		}
	}

	.atelier-header__mobile-menu {
		position: fixed;
		top: var(--atelier-header-mobile-height);
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--atelier-header-bg);
		transform: translateX(100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-header-bg-dark);
		}

		@media (min-width: 769px) {
			display: none;
		}
	}

	.atelier-header__mobile-menu--open {
		transform: translateX(0);
	}

	.atelier-header__mobile-menu-list {
		list-style: none;
		margin: 0;
		padding: 2rem 1rem;
	}

	.atelier-header__mobile-menu-item {
		margin-bottom: 1rem;
	}

	.atelier-header__mobile-menu-link {
		display: block;
		padding: 1rem;
		text-decoration: none;
		color: inherit;
		font-size: 1.125rem;
		font-weight: 450;
		letter-spacing: 0.01em;
		transition: opacity 0.2s ease;

		&:hover {
			opacity: 0.7;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.atelier-header,
		.atelier-header__mobile-menu,
		.atelier-header__mobile-toggle-icon span {
			transition: none;
		}
	}
</style>
