<script lang="ts">
	interface Props {
		kicker?: string;
		title: string;
	}

	let { kicker, title }: Props = $props();
</script>

<div class="text-center">
	{#if kicker}
		<div class="atelier-kicker">{kicker}</div>
	{/if}
	<h2 class="mt-2 text-[42px]" style="font-family: 'Cormorant Garamond', serif;">{title}</h2>
</div>
