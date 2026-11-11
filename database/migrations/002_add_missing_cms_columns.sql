-- Migration: Add missing CMS columns for full dynamic control

-- Hero profile image alt text
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS profile_image_alt TEXT;

-- About profile image alt text
ALTER TABLE about_content ADD COLUMN IF NOT EXISTS profile_image_alt TEXT;

-- Services image alt text
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- Projects visibility column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

-- Testimonials visibility and timestamp columns
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Skills and process timestamps
ALTER TABLE skills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE process_steps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
