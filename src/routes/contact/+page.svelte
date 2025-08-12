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

<div class="container mx-auto px-4 py-8 md:py-16">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Contact Us</h1>
			<p class="mx-auto max-w-2xl text-lg text-gray-600">
				We'd love to hear from you. Get in touch with any questions or to book your appointment.
			</p>
		</div>

		<div class="grid gap-12 lg:grid-cols-2">
			<div class="space-y-6">
				<h2 class="text-2xl font-semibold text-gray-900">Send Us a Message</h2>
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
						<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm"
						/>
					</div>

					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700"
							>Phone (optional)</label
						>
						<input
							type="tel"
							id="phone"
							name="phone"
							class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm"
						/>
					</div>

					<div>
						<label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
						<input
							type="text"
							id="subject"
							name="subject"
							required
							class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm"
						/>
					</div>

					<div>
						<label for="message" class="block text-sm font-medium text-gray-700">Message</label>
						<textarea
							id="message"
							name="message"
							rows={4}
							required
							class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm"
						></textarea>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{isSubmitting ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</div>

			<div class="space-y-6">
				<h2 class="text-2xl font-semibold text-gray-900">Get In Touch</h2>

				<div class="space-y-4">
					<div class="flex items-start">
						<MapPin class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Visit Us</p>
							<p class="text-gray-600">123 Main Street<br />Downtown, City 12345</p>
						</div>
					</div>

					<div class="flex items-start">
						<Phone class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Call Us</p>
							<p class="text-gray-600">(555) 123-4567</p>
						</div>
					</div>

					<div class="flex items-start">
						<Mail class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Email Us</p>
							<p class="text-gray-600">info@picassohairsalon.com</p>
						</div>
					</div>

					<div class="flex items-start">
						<Clock class="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Business Hours</p>
							<div class="text-gray-600">
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
