#!/usr/bin/env tsx

/**
 * Database Seed Script for Picasso Hair Salon
 *
 * This script converts existing mock data to live database records.
 * It uses Supabase service role for admin operations.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/types/database.types';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error('❌ Missing required environment variables:');
	console.error('- PUBLIC_SUPABASE_URL');
	console.error('- SUPABASE_SERVICE_ROLE_KEY');
	process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

// Mock data definitions
const mockServices = [
	{
		name: 'Haircut & Style',
		description: 'Professional haircut with styling',
		price: '45.00',
		duration: 60,
		category: 'Hair',
		is_active: true,
		image_url: null
	},
	{
		name: 'Hair Color',
		description: 'Full hair coloring service',
		price: '120.00',
		duration: 180,
		category: 'Color',
		is_active: true,
		image_url: null
	},
	{
		name: 'Beard Trim',
		description: 'Professional beard trimming and shaping',
		price: '25.00',
		duration: 30,
		category: 'Grooming',
		is_active: true,
		image_url: null
	},
	{
		name: 'Hair Wash',
		description: 'Deep cleansing hair wash with massage',
		price: '15.00',
		duration: 20,
		category: 'Hair',
		is_active: false,
		image_url: null
	}
];

const mockStylists = [
	{
		name: 'Sarah Johnson',
		bio: 'Master stylist with 10+ years experience in modern cuts and styling',
		specialties: ['Haircuts', 'Styling', 'Wedding Hair'],
		avatar_url: null,
		is_active: true,
		availability: {
			monday: { start: '09:00', end: '17:00' },
			tuesday: { start: '09:00', end: '17:00' },
			wednesday: { start: '09:00', end: '17:00' },
			thursday: { start: '09:00', end: '17:00' },
			friday: { start: '09:00', end: '17:00' },
			saturday: { start: '10:00', end: '16:00' },
			sunday: null
		}
	},
	{
		name: 'Maria Garcia',
		bio: 'Color specialist and creative stylist',
		specialties: ['Hair Color', 'Highlights', 'Balayage'],
		avatar_url: null,
		is_active: true,
		availability: {
			monday: { start: '10:00', end: '18:00' },
			tuesday: { start: '10:00', end: '18:00' },
			wednesday: { start: '10:00', end: '18:00' },
			thursday: { start: '10:00', end: '18:00' },
			friday: { start: '10:00', end: '18:00' },
			saturday: { start: '09:00', end: '15:00' },
			sunday: null
		}
	},
	{
		name: 'Carlos Rodriguez',
		bio: 'Barbering expert specializing in mens cuts and grooming',
		specialties: ['Mens Cuts', 'Beard Trim', 'Hot Towel Shave'],
		avatar_url: null,
		is_active: true,
		availability: {
			monday: { start: '08:00', end: '16:00' },
			tuesday: { start: '08:00', end: '16:00' },
			wednesday: { start: '08:00', end: '16:00' },
			thursday: { start: '08:00', end: '16:00' },
			friday: { start: '08:00', end: '16:00' },
			saturday: { start: '08:00', end: '14:00' },
			sunday: null
		}
	}
];

async function clearExistingData() {
	console.log('🧹 Clearing existing data...');

	// Clear tables in correct order (respecting foreign key constraints)
	await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
	await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
	await supabase.from('gallery_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
	await supabase.from('stylists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
	await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');

	console.log('✅ Existing data cleared');
}

async function seedServices() {
	console.log('🌱 Seeding services...');

	const { data, error } = await supabase.from('services').insert(mockServices).select();

	if (error) {
		console.error('❌ Error seeding services:', error);
		throw error;
	}

	console.log(`✅ Seeded ${data?.length} services`);
	return data;
}

async function seedStylists() {
	console.log('🌱 Seeding stylists...');

	const { data, error } = await supabase.from('stylists').insert(mockStylists).select();

	if (error) {
		console.error('❌ Error seeding stylists:', error);
		throw error;
	}

	console.log(`✅ Seeded ${data?.length} stylists`);
	return data;
}

async function seedSampleGalleryImages(stylists: any[]) {
	console.log('🌱 Seeding sample gallery images...');

	const sampleImages = [
		{
			url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
			title: 'Modern Bob Cut',
			description: 'Sleek and professional bob haircut',
			category: 'Haircuts',
			stylist_id: stylists[0].id,
			is_featured: true,
			display_order: 1
		},
		{
			url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
			title: 'Balayage Highlights',
			description: 'Beautiful balayage color technique',
			category: 'Color',
			stylist_id: stylists[1].id,
			is_featured: true,
			display_order: 2
		},
		{
			url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
			title: 'Classic Mens Cut',
			description: 'Traditional mens haircut and styling',
			category: 'Mens',
			stylist_id: stylists[2].id,
			is_featured: false,
			display_order: 3
		}
	];

	const { data, error } = await supabase.from('gallery_images').insert(sampleImages).select();

	if (error) {
		console.error('❌ Error seeding gallery images:', error);
		throw error;
	}

	console.log(`✅ Seeded ${data?.length} gallery images`);
	return data;
}

async function main() {
	try {
		console.log('🚀 Starting database seed process...');
		console.log(`📍 Target: ${SUPABASE_URL}`);

		// Test connection
		const { data: testData, error: testError } = await supabase
			.from('services')
			.select('count')
			.limit(1);

		if (testError) {
			console.error('❌ Failed to connect to database:', testError);
			process.exit(1);
		}

		console.log('✅ Database connection successful');

		// Clear existing data
		await clearExistingData();

		// Seed core data
		const services = await seedServices();
		const stylists = await seedStylists();

		// Seed sample gallery images
		await seedSampleGalleryImages(stylists);

		console.log('🎉 Database seeding completed successfully!');
		console.log('\n📊 Summary:');
		console.log(`- Services: ${services?.length || 0}`);
		console.log(`- Stylists: ${stylists?.length || 0}`);
		console.log('- Gallery images: 3');

		console.log('\n🔗 Next steps:');
		console.log('1. Run `pnpm dev` to test the application');
		console.log('2. Visit /services and /stylists to see the seeded data');
		console.log('3. Visit /admin to manage the data');
	} catch (error) {
		console.error('💥 Seed process failed:', error);
		process.exit(1);
	}
}

// Run the script
main();
