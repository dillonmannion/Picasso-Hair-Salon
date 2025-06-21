import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('❌ Missing required environment variables:');
	console.error('- PUBLIC_SUPABASE_URL:', !!supabaseUrl);
	console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
	process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

async function applySchema() {
	console.log('🚀 Starting database schema application...');
	console.log('📍 Target:', supabaseUrl);

	try {
		// Read schema files
		const schemaPath = join(process.cwd(), 'database', 'schema.sql');
		const migration002Path = join(
			process.cwd(),
			'database',
			'migrations',
			'002_booking_wizard_policies.sql'
		);
		const migration003Path = join(
			process.cwd(),
			'database',
			'migrations',
			'003_stylist_services.sql'
		);

		console.log('\n📄 Reading schema files...');
		const schema = readFileSync(schemaPath, 'utf-8');
		const migration002 = readFileSync(migration002Path, 'utf-8');
		const migration003 = readFileSync(migration003Path, 'utf-8');

		// Apply main schema
		console.log('\n🔧 Applying main schema...');
		const { error: schemaError } = await supabase.rpc('exec_sql', {
			sql: schema
		});

		if (schemaError) {
			// Try alternative approach - execute SQL directly
			console.log('⚠️  Direct RPC failed, trying alternative approach...');

			// Split the schema into individual statements
			const statements = schema
				.split(';')
				.map((s) => s.trim())
				.filter((s) => s.length > 0 && !s.startsWith('--'));

			console.log(`📝 Found ${statements.length} SQL statements to execute`);

			// Since we can't execute raw SQL directly, we'll need to inform the user
			console.error('\n❌ Cannot apply schema programmatically.');
			console.error('\n📋 Please apply the schema manually using one of these methods:');
			console.error('\n1. Supabase Dashboard:');
			console.error(
				'   - Go to: https://arrqhipfaejlodashfou.supabase.co/project/arrqhipfaejlodashfou/editor'
			);
			console.error('   - Navigate to SQL Editor');
			console.error('   - Copy and paste the contents of database/schema.sql');
			console.error('   - Execute the query');
			console.error('\n2. Then apply migrations in order:');
			console.error('   - database/002_booking_wizard_policies.sql');
			console.error('   - database/003_stylist_services.sql');

			process.exit(1);
		}

		console.log('✅ Main schema applied successfully');

		// Apply migration 002
		console.log('\n🔧 Applying migration 002_booking_wizard_policies...');
		const { error: migration002Error } = await supabase.rpc('exec_sql', {
			sql: migration002
		});

		if (migration002Error) {
			console.error('❌ Failed to apply migration 002:', migration002Error);
			process.exit(1);
		}

		console.log('✅ Migration 002 applied successfully');

		// Apply migration 003
		console.log('\n🔧 Applying migration 003_stylist_services...');
		const { error: migration003Error } = await supabase.rpc('exec_sql', {
			sql: migration003
		});

		if (migration003Error) {
			console.error('❌ Failed to apply migration 003:', migration003Error);
			process.exit(1);
		}

		console.log('✅ Migration 003 applied successfully');

		console.log('\n🎉 Database schema applied successfully!');
		console.log('✨ You can now run: pnpm run seed');
	} catch (error) {
		console.error('❌ Error applying schema:', error);
		process.exit(1);
	}
}

// Run the schema application
applySchema();
