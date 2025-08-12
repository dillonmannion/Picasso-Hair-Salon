#!/usr/bin/env node

/**
 * Script to apply database migrations to Supabase
 * Usage: pnpm run migrate
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
	console.error('Please check your .env file');
	process.exit(1);
}

async function applyMigration(fileName: string) {
	console.log(`\n📄 Applying migration: ${fileName}`);
	
	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	try {
		// Read the SQL file
		const sqlPath = join(process.cwd(), 'database', 'migrations', fileName);
		const sql = readFileSync(sqlPath, 'utf-8');

		// Execute the SQL
		const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

		if (error) {
			console.error(`❌ Error applying migration ${fileName}:`, error);
			return false;
		}

		console.log(`✅ Successfully applied ${fileName}`);
		return true;
	} catch (error) {
		console.error(`❌ Error reading or applying migration ${fileName}:`, error);
		return false;
	}
}

async function main() {
	console.log('🚀 Starting migration process...\n');

	// Specify which migration to apply
	const migrationFile = process.argv[2] || '004_fix_appointment_cancellation_policy.sql';
	
	const success = await applyMigration(migrationFile);
	
	if (success) {
		console.log('\n✨ Migration completed successfully!');
	} else {
		console.log('\n❌ Migration failed. Please check the errors above.');
		process.exit(1);
	}
}

main().catch((error) => {
	console.error('Unexpected error:', error);
	process.exit(1);
});