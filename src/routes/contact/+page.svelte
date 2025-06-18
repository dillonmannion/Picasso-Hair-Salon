<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { MapPin, Clock, Phone, Mail, MessageCircle } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Contact form state
	let contactForm = $state({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: ''
	});

	function handleSubmit(event: Event) {
		event.preventDefault();
		// TODO: Implement contact form submission
		console.log('Contact form submitted:', contactForm);
		// Reset form
		contactForm = {
			name: '',
			email: '',
			phone: '',
			subject: '',
			message: ''
		};
	}
</script>

<svelte:head>
	<title>{data.meta?.title || 'Contact Us - Picasso Hair Salon'}</title>
	<meta
		name="description"
		content={data.meta?.description ||
			'Get in touch with Picasso Hair Salon. Find our location, hours, phone number, and contact form.'}
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Hero Section -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Contact Us</h1>
		<p class="mx-auto max-w-2xl text-lg text-gray-600">
			We'd love to hear from you! Get in touch with any questions about our services or to schedule
			your appointment.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Contact Information -->
		<div>
			<h2 class="mb-6 text-2xl font-bold text-gray-900">Get In Touch</h2>

			<div class="space-y-6">
				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-start gap-4">
							<MapPin class="text-primary mt-1 h-6 w-6 flex-shrink-0" />
							<div>
								<h3 class="font-semibold text-gray-900">Visit Our Salon</h3>
								<p class="mt-1 text-gray-600">
									123 Beauty Street<br />
									Style City, SC 12345
								</p>
								<p class="mt-2 text-sm text-gray-500">Convenient parking available</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-start gap-4">
							<Phone class="text-primary mt-1 h-6 w-6 flex-shrink-0" />
							<div>
								<h3 class="font-semibold text-gray-900">Call Us</h3>
								<p class="mt-1 text-gray-600">(555) 123-4567</p>
								<p class="mt-2 text-sm text-gray-500">Call for appointments and inquiries</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-start gap-4">
							<Mail class="text-primary mt-1 h-6 w-6 flex-shrink-0" />
							<div>
								<h3 class="font-semibold text-gray-900">Email Us</h3>
								<p class="mt-1 text-gray-600">hello@picassoshairstudio.com</p>
								<p class="mt-2 text-sm text-gray-500">We'll respond within 24 hours</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-start gap-4">
							<Clock class="text-primary mt-1 h-6 w-6 flex-shrink-0" />
							<div>
								<h3 class="font-semibold text-gray-900">Hours</h3>
								<div class="mt-1 space-y-1 text-gray-600">
									<p>Monday - Friday: 9:00 AM - 7:00 PM</p>
									<p>Saturday: 9:00 AM - 6:00 PM</p>
									<p>Sunday: 10:00 AM - 5:00 PM</p>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<!-- Contact Form -->
		<div>
			<h2 class="mb-6 text-2xl font-bold text-gray-900">Send Us a Message</h2>

			<Card.Root>
				<Card.Content class="p-6">
					<form onsubmit={handleSubmit} class="space-y-4">
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<Label for="name">Name *</Label>
								<Input
									id="name"
									type="text"
									bind:value={contactForm.name}
									required
									placeholder="Your full name"
								/>
							</div>
							<div>
								<Label for="phone">Phone</Label>
								<Input
									id="phone"
									type="tel"
									bind:value={contactForm.phone}
									placeholder="(555) 123-4567"
								/>
							</div>
						</div>

						<div>
							<Label for="email">Email *</Label>
							<Input
								id="email"
								type="email"
								bind:value={contactForm.email}
								required
								placeholder="your.email@example.com"
							/>
						</div>

						<div>
							<Label for="subject">Subject</Label>
							<Input
								id="subject"
								type="text"
								bind:value={contactForm.subject}
								placeholder="What can we help you with?"
							/>
						</div>

						<div>
							<Label for="message">Message *</Label>
							<textarea
								id="message"
								bind:value={contactForm.message}
								required
								rows="4"
								placeholder="Tell us more about your inquiry..."
								class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							></textarea>
						</div>

						<Separator />

						<Button type="submit" class="w-full">
							<MessageCircle class="mr-2 h-4 w-4" />
							Send Message
						</Button>

						<p class="text-center text-sm text-gray-500">* Required fields</p>
					</form>
				</Card.Content>
			</Card.Root>

			<div class="mt-6">
				<Card.Root>
					<Card.Content class="p-6 text-center">
						<h3 class="mb-2 font-semibold text-gray-900">Prefer to Book Directly?</h3>
						<p class="mb-4 text-gray-600">Skip the wait and book your appointment online</p>
						<Button onclick={() => (window.location.href = '/book')} class="w-full">
							Book Appointment
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>
