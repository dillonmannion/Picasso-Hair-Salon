<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Service {
		title: string;
		body: string;
		img: string;
	}

	interface Props {
		items?: Service[];
		header?: Snippet;
	}

	let { items = [], header }: Props = $props();
</script>

<section class="relative bg-white">
	<div class="absolute inset-0">
		<div class="atelier-bg-vlines container h-full"></div>
	</div>
	<div class="relative container mx-auto py-12 md:py-16">
		{#if header}
			{@render header()}
		{/if}
		<div class="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-x-10 gap-y-14">
			{#each items as s}
				<article class="text-center">
					<div class="atelier-polaroid mx-auto w-[240px] md:w-[220px]">
						<img
							src={s.img}
							alt={s.title}
							class="aspect-square border-2 border-amber-900 object-cover"
						/>
					</div>
					<h3 class="tracking-widerish mt-6 text-[13px] font-semibold uppercase">{s.title}</h3>
					<p class="text-atelier-ink-700 mt-2 text-[14px]">{s.body}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
