# Database Setup Instructions

## Applying the Schema to Supabase

To set up the database schema for the Picasso Hair Salon project, follow these steps:

### Migrations

The database setup includes migrations for incremental changes:

1. **schema.sql** - Initial schema with all base tables
2. **migrations/003_create_orders_table.sql** - Adds orders table for Stripe payments

Apply migrations in order after the initial schema.

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard: https://arrqhipfaejlodashfou.supabase.co/project/arrqhipfaejlodashfou
2. Navigate to the SQL Editor
3. Copy the contents of `schema.sql` and paste it into a new query
4. Execute the query to create all tables, indexes, RLS policies, and triggers

### Option 2: Using Supabase CLI (For development)

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref arrqhipfaejlodashfou

# Apply the schema
supabase db push

# Or run the schema file directly
supabase db reset --db-url "your-db-connection-string"
```

### Option 3: Using psql (Direct connection)

If you have direct database access:

```bash
psql "postgresql://[username]:[password]@db.arrqhipfaejlodashfou.supabase.co:5432/postgres" -f schema.sql
```

## Generating Types (Optional - Already Created)

The TypeScript types have already been generated and saved to `src/lib/types/database.types.ts`.

If you need to regenerate them later:

```bash
supabase gen types typescript --project-id arrqhipfaejlodashfou > src/lib/types/database.types.ts
```

## Schema Overview

The database includes the following tables:

- **users**: Extended user profiles linked to auth.users
- **services**: Hair salon services with pricing and duration
- **stylists**: Stylist information and specialties
- **appointments**: Booking system linking users, services, and stylists
- **reviews**: Customer reviews and ratings
- **gallery_images**: Gallery images for showcasing work
- **orders**: Payment transaction records for Stripe integration (added in migration 003)

All tables include:

- Row Level Security (RLS) policies for data protection
- Automatic timestamp triggers for `updated_at` fields
- Appropriate indexes for performance
- Foreign key relationships with cascade deletes where appropriate

## Next Steps After Schema Creation

1. Verify the schema was applied successfully
2. Test the RLS policies by creating a test user and data
3. Consider adding some sample data for development
4. Update the Supabase client configuration to use the new types

## Database Seeding

The project includes an automated seeding script that populates the database with sample data for development and testing.

### Environment Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   - `PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `PUBLIC_SUPABASE_ANON_KEY`: Your public anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (required for seeding)

### Running the Seed Script

To populate the database with sample data:

```bash
# Seed the database with sample data
pnpm run seed

# For production environment
pnpm run seed:prod
```

The seed script will:

1. Clear existing data from all tables
2. Insert sample services (4 services including haircuts, color, grooming)
3. Insert sample stylists (3 stylists with different specialties)
4. Insert sample gallery images (3 showcase images)

### Sample Data Included

**Services:**

- Haircut & Style ($45, 60 min)
- Hair Color ($120, 180 min)
- Beard Trim ($25, 30 min)
- Hair Wash ($15, 20 min, inactive)

**Stylists:**

- Sarah Johnson (Haircuts, Styling, Wedding Hair)
- Maria Garcia (Hair Color, Highlights, Balayage)
- Carlos Rodriguez (Mens Cuts, Beard Trim, Hot Towel Shave)

**Gallery Images:**

- Modern Bob Cut
- Balayage Highlights
- Classic Mens Cut

### Manual Sample Data (Alternative)

If you prefer to add sample data manually:

```sql
-- Sample services
INSERT INTO services (name, description, price, duration, category) VALUES
('Haircut & Style', 'Professional haircut with styling', '45.00', 60, 'Hair'),
('Hair Color', 'Full hair coloring service', '120.00', 180, 'Color'),
('Beard Trim', 'Professional beard trimming and shaping', '25.00', 30, 'Grooming');

-- Sample stylists
INSERT INTO stylists (name, bio, specialties) VALUES
('Sarah Johnson', 'Master stylist with 10+ years experience', ARRAY['Haircuts', 'Styling', 'Wedding Hair']),
('Maria Garcia', 'Color specialist and creative stylist', ARRAY['Hair Color', 'Highlights', 'Balayage']);
```
