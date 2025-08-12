<script lang="ts">
	import HeroSplit from '$lib/HeroSplit.svelte';
	import SectionHeader from '$lib/SectionHeader.svelte';
	import ServicesGrid from '$lib/ServicesGrid.svelte';

	const items = [
		{
			title: 'Experienced Cut',
			body: 'Our stylists are the consummate professionals and they have a genuine commitment to the health of our clients.',
			img: '/images/svc-cut.jpg'
		},
		{
			title: 'Vibrant Colors',
			body: 'Our salon offers a color line with over 300 vibrant shades.',
			img: '/images/svc-color.jpg'
		},
		{
			title: 'Gorgeous Perms',
			body: 'Our perm system features special keratin that protects your hair.',
			img: '/images/svc-perm.jpg'
		},
		{
			title: 'Expert Treatment',
			body: 'We use the best products and advanced treatment systems.',
			img: '/images/svc-treatment.jpg'
		},
		{
			title: 'Extensions',
			body: 'Superior hair items with highlights and natural shading.',
			img: '/images/svc-extensions.jpg'
		},
		{
			title: 'Exceptional Tattoos',
			body: 'Semi‑permanent makeup services for brows, eyeliner, & lip.',
			img: '/images/svc-tattoo.jpg'
		},
		{
			title: 'Amazing Make‑Up',
			body: 'Flawless to natural everyday beauty—our team has you covered.',
			img: '/images/svc-makeup.jpg'
		},
		{
			title: 'Elegant Wedding',
			body: 'Diverse and sophisticated concepts for your unforgettable day.',
			img: '/images/svc-wedding.jpg'
		}
	];
</script>

<HeroSplit />

<div class="container py-16">
	<div class="grid items-start gap-10 md:grid-cols-2">
		<div>
			<h2 class="font-display text-[42px]">
				Celebs <span class="-mt-2 block text-[26px]">with Atelier</span>
			</h2>
			<p class="mt-4 max-w-prose">
				Celebrities consistently turn to our talented makeup artists to achieve their flawless, glam
				looks. Whether you're looking for a dramatic transformation or a subtle enhancement, we're
				dedicated to delivering the perfect look that highlights your unique style and personality.
			</p>
			<div class="mt-6">
				<div class="kicker">Follow</div>
				<div class="mt-2 flex gap-3">
					<a class="nav-link" href="#" aria-label="Instagram">IG</a>
					<a class="nav-link" href="#" aria-label="Facebook">FB</a>
					<a class="nav-link" href="#" aria-label="TikTok">TT</a>
				</div>
				<a href="/appointment" class="btn mt-6">Appointment</a>
			</div>
		</div>
		<div class="justify-self-end">
			<div class="polaroid w-[300px] rotate-[-2deg]">
				<img src="/images/interior-2.jpg" alt="Salon interior 2" />
			</div>
		</div>
	</div>
</div>

<ServicesGrid {items}>
	<svelte:fragment slot="header">
		<SectionHeader kicker="ATELIER BY TIFFANY" title="IMPRESSIVE SERVICES" />
	</svelte:fragment>
</ServicesGrid>
