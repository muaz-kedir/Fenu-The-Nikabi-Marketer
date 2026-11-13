-- Migration 004: CMS Expansion for Full Dynamic Control, SEO, Navigation, and Publishing History

-- 1. Hero Content additions
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'Available for new projects';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1;

-- 2. About Content additions
ALTER TABLE about_content ADD COLUMN IF NOT EXISTS experience_years TEXT DEFAULT '5+';
ALTER TABLE about_content ADD COLUMN IF NOT EXISTS intro_heading TEXT;
ALTER TABLE about_content ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Services additions
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_starting_from TEXT;

-- 4. Projects additions
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS marketing_objective TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategy TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS services_provided TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified_results TEXT;

-- 5. Testimonials additions
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS business_name TEXT;

-- 6. Site Settings & SEO additions
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS booking_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS brand_primary_color TEXT DEFAULT '#F8F4ED';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS brand_accent_color TEXT DEFAULT '#344238';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_heading TEXT DEFAULT 'Let’s Build Something Meaningful Together';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_description TEXT DEFAULT 'Ready to turn attention into measurable growth? Reach out and let’s talk.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS keywords TEXT DEFAULT 'marketing, social media, branding, creative direction';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- 7. Navigation Items Table
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_cta BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nav_order ON navigation_items (display_order);

-- Seed initial navigation items if empty
INSERT INTO navigation_items (label, url, is_cta, display_order)
SELECT 'About', '#about', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items);

INSERT INTO navigation_items (label, url, is_cta, display_order)
SELECT 'Services', '#services', FALSE, 2
WHERE (SELECT COUNT(*) FROM navigation_items) = 1;

INSERT INTO navigation_items (label, url, is_cta, display_order)
SELECT 'Work', '#work', FALSE, 3
WHERE (SELECT COUNT(*) FROM navigation_items) = 2;

INSERT INTO navigation_items (label, url, is_cta, display_order)
SELECT 'Process', '#process', FALSE, 4
WHERE (SELECT COUNT(*) FROM navigation_items) = 3;

INSERT INTO navigation_items (label, url, is_cta, display_order)
SELECT 'Testimonials', '#testimonials', FALSE, 5
WHERE (SELECT COUNT(*) FROM navigation_items) = 4;

INSERT INTO navigation_items (label, url, is_cta, display_order)
SELECT 'Get in Touch', '#contact', TRUE, 6
WHERE (SELECT COUNT(*) FROM navigation_items) = 5;

-- 8. Publishing History & Audit Logs Table
CREATE TABLE IF NOT EXISTS publishing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL DEFAULT 'admin',
  admin_email TEXT NOT NULL DEFAULT 'admin@example.com',
  action TEXT NOT NULL, -- 'publish', 'save_draft', 'restore', 'unpublish'
  section TEXT NOT NULL, -- 'hero', 'about', 'services', 'projects', etc.
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pub_history_created ON publishing_history(created_at DESC);
