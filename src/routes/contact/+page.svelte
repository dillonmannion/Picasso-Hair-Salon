<script lang="ts">
	import { enhance } from '$app/forms';
	import { Clock, Mail, MapPin, Phone } from 'lucide-svelte';

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Contact Us - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Get in touch with Picasso Hair Salon - We're here to answer your questions and help you book your next appointment"
	/>
</svelte:head>

<div
	class="from-luxe-cream-50 container mx-auto min-h-screen bg-gradient-to-b to-white px-4 py-8 md:py-16"
>
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<h1
				class="text-luxe-burgundy-700 mb-4 font-['Cormorant_Garamond'] text-4xl font-light sm:text-5xl"
			>
				Contact Us
			</h1>
			<p class="text-luxe-black-600 mx-auto max-w-2xl text-lg">
				We'd love to hear from you. Get in touch with any questions or to book your appointment.
			</p>
		</div>

		<div class="grid gap-12 lg:grid-cols-2">
			<div
				class="border-luxe-cream-400 bg-luxe-cream-50 space-y-6 rounded-xl border p-8 shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
			>
				<h2 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal">
					Send Us a Message
				</h2>
				<form
					method="POST"
					action="/contact"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
					class="space-y-6"
				>
					<div>
						<label
							for="name"
							class="text-luxe-black-600 block text-sm font-medium tracking-wider uppercase"
						>
							Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							class="border-luxe-cream-400 text-luxe-black-800 focus:border-luxe-burgundy-700 focus:ring-luxe-burgundy-200 mt-1 block w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
						/>
					</div>

					<div>
						<label
							for="email"
							class="text-luxe-black-600 block text-sm font-medium tracking-wider uppercase"
							>Email</label
						>
						<input
							type="email"
							id="email"
							name="email"
							required
							class="border-luxe-cream-400 text-luxe-black-800 focus:border-luxe-burgundy-700 focus:ring-luxe-burgundy-200 mt-1 block w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
						/>
					</div>

					<div>
						<label
							for="phone"
							class="text-luxe-black-600 block text-sm font-medium tracking-wider uppercase"
							>Phone (optional)</label
						>
						<input
							type="tel"
							id="phone"
							name="phone"
							class="border-luxe-cream-400 text-luxe-black-800 focus:border-luxe-burgundy-700 focus:ring-luxe-burgundy-200 mt-1 block w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
						/>
					</div>

					<div>
						<label
							for="subject"
							class="text-luxe-black-600 block text-sm font-medium tracking-wider uppercase"
							>Subject</label
						>
						<input
							type="text"
							id="subject"
							name="subject"
							required
							class="border-luxe-cream-400 text-luxe-black-800 focus:border-luxe-burgundy-700 focus:ring-luxe-burgundy-200 mt-1 block w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
						/>
					</div>

					<div>
						<label
							for="message"
							class="text-luxe-black-600 block text-sm font-medium tracking-wider uppercase"
							>Message</label
						>
						<textarea
							id="message"
							name="message"
							rows={4}
							required
							class="border-luxe-cream-400 text-luxe-black-800 focus:border-luxe-burgundy-700 focus:ring-luxe-burgundy-200 mt-1 block w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
						></textarea>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-600 focus:ring-luxe-burgundy-200 disabled:bg-luxe-black-400 w-full rounded-md px-4 py-3 text-sm font-medium shadow-[0_2px_4px_rgba(94,28,28,0.08)] transition-all hover:shadow-[0_4px_8px_rgba(94,28,28,0.12)] focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</div>

			<div
				class="border-luxe-cream-400 bg-luxe-cream-50 space-y-6 rounded-xl border p-8 shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
			>
				<h2 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal">
					Get In Touch
				</h2>

				<div class="space-y-4">
					<div class="bg-luxe-cream-100 flex items-start rounded-lg p-4">
						<MapPin class="text-luxe-burgundy-700 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="text-luxe-black-800 font-medium">Visit Us</p>
							<p class="text-luxe-black-600">123 Main Street<br />Downtown, City 12345</p>
						</div>
					</div>

					<div class="bg-luxe-cream-100 flex items-start rounded-lg p-4">
						<Phone class="text-luxe-burgundy-700 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="text-luxe-black-800 font-medium">Call Us</p>
							<p class="text-luxe-black-600">(555) 123-4567</p>
						</div>
					</div>

					<div class="bg-luxe-cream-100 flex items-start rounded-lg p-4">
						<Mail class="text-luxe-burgundy-700 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="text-luxe-black-800 font-medium">Email Us</p>
							<p class="text-luxe-black-600">info@picassohairsalon.com</p>
						</div>
					</div>

					<div class="bg-luxe-cream-100 flex items-start rounded-lg p-4">
						<Clock class="text-luxe-burgundy-700 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="text-luxe-black-800 font-medium">Business Hours</p>
							<div class="text-luxe-black-600">
								<p>Monday - Friday: 9:00 AM - 7:00 PM</p>
								<p>Saturday: 9:00 AM - 6:00 PM</p>
								<p>Sunday: 10:00 AM - 5:00 PM</p>
							</div>
						</div>
					</div>
				</div>

				<div class="rounded-lg bg-gray-50 p-6">
					<h3 class="mb-3 text-lg font-semibold text-gray-900">Quick Links</h3>
					<div class="space-y-2">
						<a href="/appointments" class="text-primary-600 hover:text-primary-700 block"
							>Book an Appointment</a
						>
						<a href="/services" class="text-primary-600 hover:text-primary-700 block"
							>View Our Services</a
						>
						<a href="/gallery" class="text-primary-600 hover:text-primary-700 block">See Our Work</a
						>
					</div>
				</div>

				<div class="bg-primary-50 rounded-lg p-6">
					<h3 class="mb-3 text-lg font-semibold text-gray-900">Follow Us</h3>
					<p class="mb-4 text-gray-600">Stay connected for the latest updates and styling tips!</p>
					<div class="flex space-x-4">
						<a href="http://www.facebook.com" class="text-primary-600 hover:text-primary-700"
							>Facebook</a
						>
						<a href="http://www.instagram.com" class="text-primary-600 hover:text-primary-700"
							>Instagram</a
						>
						<a href="http://www.twitter.com" class="text-primary-600 hover:text-primary-700"
							>Twitter</a
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
