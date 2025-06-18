<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { MapPin, Clock, Phone, Mail, Star, Users, Award, Heart } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.meta?.title || 'About Us - Picasso Hair Salon'}</title>
	<meta
		name="description"
		content={data.meta?.description ||
			"Learn about Picasso Hair Salon's story, our expert stylists, and our commitment to exceptional hair care."}
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Hero Section -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">About Picasso Hair Salon</h1>
		<p class="mx-auto max-w-3xl text-lg text-gray-600">
			Where artistry meets expertise. Since our founding, we've been dedicated to creating beautiful
			hair transformations that enhance your natural beauty and express your unique style.
		</p>
	</div>

	<!-- Our Story Section -->
	<div class="mb-12">
		<Card.Root class="p-8">
			<Card.Header>
				<Card.Title class="text-2xl">Our Story</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4 text-gray-600">
				<p>
					Founded with a passion for hair artistry, Picasso Hair Salon has become a premier
					destination for those seeking exceptional hair care services. Our name reflects our belief
					that every hairstyle is a work of art, crafted with precision, creativity, and an eye for
					detail.
				</p>
				<p>
					What started as a small salon with big dreams has grown into a full-service hair
					destination, thanks to our commitment to continuous learning, staying ahead of trends, and
					most importantly, listening to our clients.
				</p>
				<p>
					Today, we're proud to serve our community with a team of skilled stylists who share our
					passion for transforming not just hair, but confidence and self-expression.
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Values Section -->
	<div class="mb-12">
		<h2 class="mb-6 text-center text-3xl font-bold text-gray-900">Our Values</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root class="p-6 text-center">
				<Card.Content class="pt-6">
					<Star class="text-primary mx-auto mb-4 h-12 w-12" />
					<h3 class="mb-2 text-lg font-semibold">Excellence</h3>
					<p class="text-sm text-gray-600">
						We strive for perfection in every cut, color, and style.
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root class="p-6 text-center">
				<Card.Content class="pt-6">
					<Users class="text-primary mx-auto mb-4 h-12 w-12" />
					<h3 class="mb-2 text-lg font-semibold">Community</h3>
					<p class="text-sm text-gray-600">
						Building lasting relationships with our clients and community.
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root class="p-6 text-center">
				<Card.Content class="pt-6">
					<Award class="text-primary mx-auto mb-4 h-12 w-12" />
					<h3 class="mb-2 text-lg font-semibold">Innovation</h3>
					<p class="text-sm text-gray-600">
						Staying current with the latest trends and techniques.
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root class="p-6 text-center">
				<Card.Content class="pt-6">
					<Heart class="text-primary mx-auto mb-4 h-12 w-12" />
					<h3 class="mb-2 text-lg font-semibold">Passion</h3>
					<p class="text-sm text-gray-600">Love for what we do shows in every transformation.</p>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<!-- Contact Info Section -->
	<div class="mb-12">
		<h2 class="mb-6 text-center text-3xl font-bold text-gray-900">Visit Us</h2>
		<Card.Root class="mx-auto max-w-2xl">
			<Card.Content class="p-8">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<MapPin class="text-primary h-5 w-5" />
							<div>
								<p class="font-semibold">Address</p>
								<p class="text-sm text-gray-600">123 Beauty Street<br />Style City, SC 12345</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<Phone class="text-primary h-5 w-5" />
							<div>
								<p class="font-semibold">Phone</p>
								<p class="text-sm text-gray-600">(555) 123-4567</p>
							</div>
						</div>
					</div>

					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<Clock class="text-primary h-5 w-5" />
							<div>
								<p class="font-semibold">Hours</p>
								<p class="text-sm text-gray-600">
									Mon-Fri: 9AM-7PM<br />
									Sat: 9AM-6PM<br />
									Sun: 10AM-5PM
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<Mail class="text-primary h-5 w-5" />
							<div>
								<p class="font-semibold">Email</p>
								<p class="text-sm text-gray-600">hello@picassoshairstudio.com</p>
							</div>
						</div>
					</div>
				</div>

				<Separator class="my-6" />

				<div class="text-center">
					<p class="text-gray-600">
						Ready to transform your look? Book your appointment today and let our expert stylists
						create your masterpiece.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
