-- Migration: Add stylist-service relationship table
-- Date: 2025-06-21

-- Create junction table for stylists and services
CREATE TABLE IF NOT EXISTS stylist_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(stylist_id, service_id)
);

-- Enable RLS
ALTER TABLE stylist_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view stylist services" ON stylist_services
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to stylist services" ON stylist_services
  FOR ALL TO authenticated 
  USING (
    (auth.jwt() ->> 'email') = ANY(ARRAY['admin@picassosalon.com', 'owner@picassosalon.com'])
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_stylist_services_stylist ON stylist_services(stylist_id);
CREATE INDEX IF NOT EXISTS idx_stylist_services_service ON stylist_services(service_id);

-- Sample data for testing (remove in production)
-- This assumes you have some stylists and services already in the database
-- INSERT INTO stylist_services (stylist_id, service_id)
-- SELECT s.id, srv.id
-- FROM stylists s
-- CROSS JOIN services srv
-- WHERE s.is_active = true AND srv.is_active = true
-- ON CONFLICT DO NOTHING;