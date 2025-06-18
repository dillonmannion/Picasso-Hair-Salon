# Database Setup Instructions

## Applying the Schema to Supabase

To set up the database schema for the Picasso Hair Salon project, follow these steps:

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

## Sample Data (Optional)

You may want to add some sample services and stylists for development:

```sql
-- Sample services
INSERT INTO services (name, description, price, duration, category) VALUES
('Haircut & Style', 'Professional haircut with styling', 65.00, 60, 'haircut'),
('Color & Highlights', 'Full color treatment with highlights', 150.00, 180, 'color'),
('Blowout', 'Professional blowout and style', 45.00, 45, 'styling');

-- Sample stylist
INSERT INTO stylists (name, bio, specialties) VALUES
('Maria Rodriguez', 'Expert colorist with 10+ years experience', ARRAY['color', 'highlights', 'balayage']);
```