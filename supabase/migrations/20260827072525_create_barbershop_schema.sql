/*
# Luxury Barbershop AI Marketing App - Database Schema

1. Overview
This migration creates the complete schema for a luxury barbershop AI marketing application.
The app is single-tenant (no sign-in required) so all policies allow anon + authenticated access.

2. New Tables
- `services`: Barbershop service menu (haircut, shave, beard trim, etc.) with name, description, price, duration.
- `customers`: Customer profiles with name, email, phone, loyalty points total, visit count.
- `appointments`: Booking calendar entries linking customers to services with date/time, status, notes.
- `content_generations`: AI-generated marketing content records (type: text/email/code/image_prompt, prompt, output).
- `loyalty_transactions`: Point earning/redemption history per customer.
- `social_posts`: Social media post drafts and publishing status per platform.

3. Security
- RLS enabled on all tables.
- All policies use TO anon, authenticated with USING (true) / WITH CHECK (true) since this is a single-tenant shared app with no sign-in.
*/

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 30,
  category text DEFAULT 'cut',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  loyalty_points integer NOT NULL DEFAULT 0,
  total_visits integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Content generations table
CREATE TABLE IF NOT EXISTS content_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  prompt text NOT NULL,
  output text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  points integer NOT NULL,
  transaction_type text NOT NULL DEFAULT 'earn',
  description text,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  caption text NOT NULL,
  content text,
  image_prompt text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Services policies
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

-- Customers policies
DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE TO anon, authenticated USING (true);

-- Appointments policies
DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE TO anon, authenticated USING (true);

-- Content generations policies
DROP POLICY IF EXISTS "anon_select_content" ON content_generations;
CREATE POLICY "anon_select_content" ON content_generations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_content" ON content_generations;
CREATE POLICY "anon_insert_content" ON content_generations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_content" ON content_generations;
CREATE POLICY "anon_update_content" ON content_generations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_content" ON content_generations;
CREATE POLICY "anon_delete_content" ON content_generations FOR DELETE TO anon, authenticated USING (true);

-- Loyalty transactions policies
DROP POLICY IF EXISTS "anon_select_loyalty" ON loyalty_transactions;
CREATE POLICY "anon_select_loyalty" ON loyalty_transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_loyalty" ON loyalty_transactions;
CREATE POLICY "anon_insert_loyalty" ON loyalty_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_loyalty" ON loyalty_transactions;
CREATE POLICY "anon_update_loyalty" ON loyalty_transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_loyalty" ON loyalty_transactions;
CREATE POLICY "anon_delete_loyalty" ON loyalty_transactions FOR DELETE TO anon, authenticated USING (true);

-- Social posts policies
DROP POLICY IF EXISTS "anon_select_social" ON social_posts;
CREATE POLICY "anon_select_social" ON social_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_social" ON social_posts;
CREATE POLICY "anon_insert_social" ON social_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_social" ON social_posts;
CREATE POLICY "anon_update_social" ON social_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_social" ON social_posts;
CREATE POLICY "anon_delete_social" ON social_posts FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_customer ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content_generations(content_type);
CREATE INDEX IF NOT EXISTS idx_social_platform ON social_posts(platform);

-- Seed default services
INSERT INTO services (name, description, price_cents, duration_minutes, category) VALUES
('Classic Haircut', 'Precision cut tailored to your style with hot towel finish', 4500, 45, 'cut'),
('Skin Fade', 'Sharp gradient fade with clean line-up', 5000, 50, 'cut'),
('Beard Sculpt', 'Beard shaping and conditioning with hot oil treatment', 3500, 30, 'beard'),
('Royal Shave', 'Traditional straight razor shave with hot towel', 4000, 35, 'shave'),
('Cut & Beard Combo', 'Full haircut and beard sculpt package', 7000, 75, 'combo'),
('Kids Cut', 'Haircut for our youngest gentlemen under 12', 3000, 30, 'cut'),
('Hair & Scalp Treatment', 'Deep conditioning scalp massage and treatment', 5500, 40, 'treatment'),
('Executive Package', 'Cut, shave, scalp treatment, and shoe shine', 12000, 120, 'combo')
ON CONFLICT DO NOTHING;
