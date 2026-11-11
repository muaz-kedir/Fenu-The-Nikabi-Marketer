-- Complete Supabase Schema, RLS Policies, and Storage Setup for Fenu Portfolio CMS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  site_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  profile_image_url TEXT,
  profile_image_alt TEXT,
  resume_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  linkedin_url TEXT,
  whatsapp_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  copyright_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hero Content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  greeting TEXT NOT NULL,
  full_name TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  description TEXT NOT NULL,
  profile_image_url TEXT,
  profile_image_alt TEXT,
  background_image_url TEXT,
  primary_button_text TEXT NOT NULL,
  primary_button_url TEXT NOT NULL,
  secondary_button_text TEXT,
  secondary_button_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. About Content
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  profile_image_url TEXT,
  profile_image_alt TEXT,
  additional_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CTA Content
CREATE TABLE IF NOT EXISTS cta_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  script_greeting TEXT,
  main_heading TEXT,
  supporting_description TEXT,
  highlighted_words TEXT,
  button_text TEXT,
  button_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Footer Content
CREATE TABLE IF NOT EXISTS footer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  copyright_text TEXT,
  email TEXT,
  phone TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  linkedin_url TEXT,
  whatsapp_url TEXT,
  footer_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Statistics
CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  suffix TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  image_alt TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT,
  cover_image_url TEXT,
  result_metric TEXT,
  result_description TEXT,
  case_study_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Process Steps
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  step_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  client_name TEXT NOT NULL,
  client_designation TEXT NOT NULL,
  client_image_url TEXT,
  testimonial TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Page Sections
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  section_key TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (section_key, is_published)
);

-- 13. Media Items
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  alt_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Portfolio Content Cache
CREATE TABLE IF NOT EXISTS portfolio_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_content ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Published Content
CREATE POLICY "Public can view published site_settings" ON site_settings FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view published hero_content" ON hero_content FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view published about_content" ON about_content FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view published cta_content" ON cta_content FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view published footer_content" ON footer_content FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view published statistics" ON statistics FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view published services" ON services FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view published projects" ON projects FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view published skills" ON skills FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view published process_steps" ON process_steps FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view published page_sections" ON page_sections FOR SELECT USING (is_published = TRUE AND is_visible = TRUE);
CREATE POLICY "Public can view media_items" ON media_items FOR SELECT USING (TRUE);

-- 2. Contact messages policies
-- Anonymous visitors can insert contact messages with basic validation
CREATE POLICY "Public can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (
    sender_name IS NOT NULL AND sender_name <> '' AND
    sender_email IS NOT NULL AND sender_email <> '' AND
    message IS NOT NULL AND message <> ''
  );

-- Anonymous visitors CANNOT read contact messages (ensures privacy)
-- Authenticated users (admin) can read, update status, and delete contact messages
CREATE POLICY "Authenticated admin full access to contact_messages" ON contact_messages
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 3. Authenticated Admin Full CRUD Policies for all CMS tables
CREATE POLICY "Admin full access to site_settings" ON site_settings FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to hero_content" ON hero_content FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to about_content" ON about_content FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to cta_content" ON cta_content FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to footer_content" ON footer_content FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to statistics" ON statistics FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to services" ON services FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to projects" ON projects FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to skills" ON skills FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to process_steps" ON process_steps FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to testimonials" ON testimonials FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to page_sections" ON page_sections FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to media_items" ON media_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access to portfolio_content" ON portfolio_content FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 4. Storage Bucket Configuration (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Public can view files in portfolio-media bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-media');

-- Authenticated admin can upload files to portfolio-media bucket
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media');

-- Authenticated admin can update files in portfolio-media bucket
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-media');

-- Authenticated admin can delete files in portfolio-media bucket
CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-media');
