<script lang="ts">
	export type Service = { title: string; body: string; img: string };
	export let items: Service[] = [];
</script>

<section class="relative bg-white">
	<div class="bg-vlines absolute inset-0"></div>
	<div class="relative container py-12 md:py-16">
		<slot name="header" />
		<div class="mt-10 grid gap-y-14 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4">
			{#each items as s}
				<article class="text-center">
					<div class="polaroid mx-auto w-[240px] md:w-[220px]">
						<img src={s.img} alt={s.title} class="aspect-square" />
					</div>
					<h3 class="tracking-widerish mt-6 text-[13px] uppercase">{s.title}</h3>
					<p class="text-ink-700 mt-2 text-[14px]">{s.body}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
