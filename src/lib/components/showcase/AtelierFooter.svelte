<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-atelier-line bg-atelier-paper-50 mt-20 border-t">
	<div class="container py-12">
		<div class="grid gap-8 md:grid-cols-3">
			<div>
				<h3 class="mb-4 text-xl" style="font-family: 'Cormorant Garamond', serif;">PICASSO</h3>
				<p class="text-atelier-ink-700 text-sm">
					Elevating your style with passion and precision since 2020.
				</p>
			</div>

			<div>
				<h4 class="atelier-kicker mb-4">HOURS</h4>
				<ul class="text-atelier-ink-700 space-y-1 text-sm">
					<li>Monday - Friday: 9am - 7pm</li>
					<li>Saturday: 9am - 6pm</li>
					<li>Sunday: 10am - 5pm</li>
				</ul>
			</div>

			<div>
				<h4 class="atelier-kicker mb-4">CONNECT</h4>
				<div class="flex gap-4">
					<a href="https://instagram.com" class="atelier-nav-link">Instagram</a>
					<a href="https://facebook.com" class="atelier-nav-link">Facebook</a>
					<a href="https://tiktok.com" class="atelier-nav-link">TikTok</a>
				</div>
				<a href="/booking/service" class="atelier-btn mt-4">Book Now</a>
			</div>
		</div>

		<div class="border-atelier-line text-atelier-ink-500 mt-8 border-t pt-8 text-center text-sm">
			© {currentYear} Picasso Hair Salon. All rights reserved.
		</div>
	</div>
</footer>
