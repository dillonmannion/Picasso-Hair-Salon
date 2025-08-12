<script lang="ts">
	export let kicker = 'ATELIER BY TIFFANY';
	export let title = 'IMPRESSIVE SERVICES';
	export let center = true;
</script>

<div class={center ? 'text-center' : ''}>
	<div class="kicker">{kicker}</div>
	<h2 class="tracking-wideish mt-2">{title}</h2>
</div>
