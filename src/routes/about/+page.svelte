<script lang="ts">
	import { MapPin, Clock, Phone, Mail } from 'lucide-svelte';
</script>

<svelte:head>
	<title>About Us - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Learn about Picasso Hair Salon - your premier destination for exceptional hair care and styling services"
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8 md:py-16">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
				About Picasso Hair Salon
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-gray-600">
				Where artistry meets hair care excellence
			</p>
		</div>

		<div class="grid gap-12 lg:grid-cols-2">
			<div class="space-y-6">
				<section>
					<h2 class="mb-4 text-2xl font-semibold text-gray-900">Our Story</h2>
					<div class="space-y-4 text-gray-600">
						<p>
							Founded with a passion for transforming hair into works of art, Picasso Hair Salon has
							been serving our community with dedication and expertise since our opening. We believe
							that every client deserves to feel confident and beautiful.
						</p>
						<p>
							Our team of skilled stylists combines creativity with technical excellence to deliver
							personalized results that exceed expectations. We stay current with the latest trends
							and techniques while maintaining our commitment to classic elegance.
						</p>
					</div>
				</section>

				<section>
					<h2 class="mb-4 text-2xl font-semibold text-gray-900">Our Mission</h2>
					<p class="text-gray-600">
						To provide exceptional hair care services in a welcoming, professional environment where
						every client feels valued and leaves looking and feeling their absolute best.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl font-semibold text-gray-900">Why Choose Us</h2>
					<ul class="space-y-3 text-gray-600">
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							Experienced and certified stylists
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							Premium quality products
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							Personalized consultations
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							Comfortable and modern facility
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							Competitive pricing
						</li>
					</ul>
				</section>
			</div>

			<div class="space-y-6">
				<div class="overflow-hidden rounded-lg bg-gray-50 p-6">
					<h3 class="mb-4 text-xl font-semibold text-gray-900">Visit Us</h3>
					<div class="space-y-4">
						<div class="flex items-start">
							<MapPin class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="font-medium text-gray-900">Location</p>
								<p class="text-gray-600">123 Main Street<br />Downtown, City 12345</p>
							</div>
						</div>
						<div class="flex items-start">
							<Clock class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="font-medium text-gray-900">Hours</p>
								<p class="text-gray-600">
									Monday - Friday: 9:00 AM - 7:00 PM<br />
									Saturday: 9:00 AM - 6:00 PM<br />
									Sunday: 10:00 AM - 5:00 PM
								</p>
							</div>
						</div>
						<div class="flex items-start">
							<Phone class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="font-medium text-gray-900">Phone</p>
								<p class="text-gray-600">(555) 123-4567</p>
							</div>
						</div>
						<div class="flex items-start">
							<Mail class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="font-medium text-gray-900">Email</p>
								<p class="text-gray-600">info@picassohairsalon.com</p>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-primary-50 overflow-hidden rounded-lg p-6">
					<h3 class="mb-4 text-xl font-semibold text-gray-900">Ready to Transform Your Look?</h3>
					<p class="mb-4 text-gray-600">
						Book an appointment today and let our talented stylists create the perfect look for you.
					</p>
					<a
						href="/appointments"
						class="bg-primary-600 hover:bg-primary-700 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
					>
						Book Appointment
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
