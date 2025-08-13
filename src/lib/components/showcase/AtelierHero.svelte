<script lang="ts">
	interface Props {
		leftImg?: string;
		polaroid?: string;
		scissors?: string;
		comb?: string;
		theme?: 'atelier' | 'luxe';
	}

	let {
		leftImg = '/images/hero-bw.jpg',
		polaroid = '/images/interior-1.jpg',
		scissors = '/images/scissors.png',
		comb = '/images/comb.png',
		theme = 'atelier'
	}: Props = $props();
</script>

<section class="relative grid min-h-[80svh] bg-white lg:grid-cols-2">
	<div class="relative overflow-hidden">
		<img src={leftImg} alt="" class="h-full w-full object-cover grayscale" />
	</div>

	<div class="relative mr-3 ml-2">
		<div class="container py-12 lg:py-20">
			<h1 class="mb-6">
				<span class="block text-[36px] md:text-[44px] {theme === 'luxe' ? 'text-[#5e1c1c]' : ''}"
					>PICASSO</span
				>
				<span
					class="-mt-2 block text-[22px] md:text-[26px] {theme === 'luxe' ? 'text-[#5e1c1c]' : ''}"
					>Hair Salon</span
				>
			</h1>

			<div class="grid items-start gap-8 md:grid-cols-[1fr_auto]">
				<div class="space-y-4">
					<h3
						class="tracking-widerish text-[13px] font-semibold uppercase {theme === 'luxe'
							? 'text-black'
							: ''}"
					>
						Relax and Recharge
					</h3>
					<p class={theme === 'luxe' ? 'text-black' : ''}>
						Picasso Hair Salon offers professional services tailored to your every need. Our
						talented team combines extensive knowledge of hair care with boundless creativity to
						deliver exceptional results every time.
					</p>
					<p class={theme === 'luxe' ? 'text-black' : ''}>
						Whether you're looking to refresh your look or indulge in a full transformation, you can
						trust us to provide a top‑notch experience that leaves you feeling relaxed and
						recharged.
					</p>
					<div class="mt-4">
						<div class="showcase-kicker {theme === 'luxe' ? '!text-[#b94545]' : ''}">Follow</div>
						<div class="mt-2 flex gap-3">
							<a
								class="showcase-nav-link {theme === 'luxe' ? '!text-[#7d2525]' : ''}"
								href="https://instagram.com"
								aria-label="Instagram">IG</a
							>
							<a
								class="showcase-nav-link {theme === 'luxe' ? '!text-[#7d2525]' : ''}"
								href="https://facebook.com"
								aria-label="Facebook">FB</a
							>
							<a
								class="showcase-nav-link {theme === 'luxe' ? '!text-[#7d2525]' : ''}"
								href="https://tiktok.com"
								aria-label="TikTok">TT</a
							>
						</div>
						<a
							href="/booking/service"
							class="showcase-btn mt-6 {theme === 'luxe' ? '!bg-[#7d2525]' : ''}"
							>Book Appointment</a
						>
					</div>
				</div>

				<div class="relative">
					<div class="showcase-polaroid w-[280px] translate-y-3 rotate-2 md:w-[320px]">
						<img src={polaroid} alt="Salon interior" />
					</div>
				</div>
			</div>
		</div>

		<!-- Decorative images with visibility ensured -->
		<img
			src={scissors}
			alt=""
			class="absolute hidden lg:block"
			style="top: 2.5rem; right: 2.5rem; width: 5rem; opacity: 0.1; filter: grayscale(100%) contrast(50%); pointer-events: none; z-index: 1;"
		/>
		<img
			src={comb}
			alt=""
			class="absolute hidden lg:block"
			style="bottom: 2.5rem; right: 2.5rem; width: 6rem; opacity: 0.1; filter: grayscale(100%) contrast(50%); pointer-events: none; z-index: 1;"
		/>
	</div>
</section>
