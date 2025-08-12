<script lang="ts">
	export let leftImg = '/images/hero-bw.jpg';
	export let polaroid = '/images/interior-1.jpg';
	export let scissors = '/images/scissors.png';
	export let comb = '/images/comb.png';
</script>

<section class="relative grid min-h-[80svh] bg-white lg:grid-cols-2">
	<div class="relative overflow-hidden">
		<img src={leftImg} alt="" class="h-full w-full object-cover grayscale" />
		<div class="absolute top-1/3 left-10 max-w-[14rem] text-white">
			<div class="tracking-widerish text-sm/5 uppercase opacity-90">More on Atelier</div>
			<ul class="mt-3 space-y-2 text-sm/6">
				<li><a class="hover:underline" href="/team">Professional Team</a></li>
				<li><a class="hover:underline" href="/appointment">Appointment</a></li>
				<li><a class="hover:underline" href="/contact">Contact</a></li>
			</ul>
		</div>
	</div>

	<div class="relative">
		<div class="container py-12 lg:py-20">
			<h1 class="mb-6">
				<span class="block text-[36px] md:text-[44px]">ATELIER</span>
				<span class="-mt-2 block text-[22px] md:text-[26px]">by Tiffany</span>
			</h1>

			<div class="grid items-start gap-8 md:grid-cols-[1fr_auto]">
				<div class="space-y-4">
					<h3 class="tracking-widerish text-[13px] font-semibold uppercase">Relax and Recharge</h3>
					<p>
						Atelier by Tiffany offers professional services tailored to your every need. Our
						talented team combines extensive knowledge of hair care with boundless creativity to
						deliver exceptional results every time.
					</p>
					<p>
						Whether you're looking to refresh your look or indulge in a full transformation, you can
						trust us to provide a top‑notch experience that leaves you feeling relaxed and
						recharged.
					</p>
					<div class="mt-4">
						<div class="kicker">Follow</div>
						<div class="mt-2 flex gap-3">
							<a class="nav-link" href="#" aria-label="Instagram">IG</a>
							<a class="nav-link" href="#" aria-label="Facebook">FB</a>
							<a class="nav-link" href="#" aria-label="TikTok">TT</a>
						</div>
						<a href="/appointment" class="btn mt-6">Appointment</a>
					</div>
				</div>

				<div class="relative">
					<div class="polaroid w-[280px] translate-y-3 rotate-2 md:w-[320px]">
						<img src={polaroid} alt="Salon interior" />
					</div>
				</div>
			</div>
		</div>

		<img src={scissors} alt="" class="float-art absolute top-1/4 right-6 hidden w-24 md:block" />
		<img
			src={comb}
			alt=""
			class="float-art absolute right-[10%] bottom-[20%] hidden w-28 md:block"
		/>
	</div>
</section>
