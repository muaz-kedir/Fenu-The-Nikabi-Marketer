-- Core portfolio schema for local PostgreSQL / Supabase-compatible deployments

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

CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  greeting TEXT NOT NULL,
  full_name TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  description TEXT NOT NULL,
  profile_image_url TEXT,
  background_image_url TEXT,
  primary_button_text TEXT NOT NULL,
  primary_button_url TEXT NOT NULL,
  secondary_button_text TEXT,
  secondary_button_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  profile_image_url TEXT,
  additional_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
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

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  step_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  client_name TEXT NOT NULL,
  client_designation TEXT NOT NULL,
  client_image_url TEXT,
  testimonial TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_statistics_order ON statistics (display_order);
CREATE INDEX IF NOT EXISTS idx_services_order ON services (display_order);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects (display_order);
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills (display_order);
CREATE INDEX IF NOT EXISTS idx_process_order ON process_steps (display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials (display_order);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections (display_order);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);
