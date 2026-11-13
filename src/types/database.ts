export type UserRole = 'admin' | 'editor' | 'viewer';

export type SiteSettings = {
  id: string;
  is_published?: boolean;
  site_name: string;
  owner_name: string;
  professional_title: string;
  email: string;
  phone: string;
  location: string;
  logo_url: string | null;
  favicon_url: string | null;
  profile_image_url: string | null;
  profile_image_alt?: string | null;
  resume_url: string | null;
  instagram_url: string;
  tiktok_url: string;
  linkedin_url: string;
  whatsapp_url: string;
  facebook_url?: string | null;
  booking_url?: string | null;
  announcement_text?: string | null;
  announcement_active?: boolean;
  brand_primary_color?: string | null;
  brand_accent_color?: string | null;
  contact_heading?: string | null;
  contact_description?: string | null;
  seo_title: string;
  seo_description: string;
  keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  copyright_text: string;
  updated_at: string;
};

export type PageSection = {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  is_visible: boolean;
  is_published?: boolean;
  display_order: number;
  updated_at: string;
};

export type HeroContent = {
  id: string;
  is_published?: boolean;
  greeting: string;
  full_name: string;
  professional_title: string;
  subtitle?: string | null;
  description: string;
  availability_status?: string | null;
  profile_image_url: string | null;
  profile_image_alt?: string | null;
  background_image_url: string | null;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  is_visible?: boolean;
  display_order?: number;
  updated_at: string;
};

export type AboutContent = {
  id: string;
  is_published?: boolean;
  title: string;
  subtitle: string | null;
  intro_heading?: string | null;
  description: string;
  experience_years?: number | string | null;
  profile_image_url: string | null;
  profile_image_alt?: string | null;
  additional_description: string | null;
  is_visible?: boolean;
  updated_at: string;
};

export type CtaContent = {
  id: string;
  is_published?: boolean;
  script_greeting: string;
  main_heading: string;
  supporting_description: string;
  highlighted_words: string;
  button_text: string;
  button_url: string;
  updated_at: string;
};

export type FooterContent = {
  id: string;
  is_published?: boolean;
  copyright_text: string;
  email: string;
  phone: string;
  instagram_url: string;
  tiktok_url: string;
  linkedin_url: string;
  whatsapp_url: string;
  footer_description: string;
  updated_at: string;
};

export type Statistic = {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  icon: string;
  display_order: number;
  is_visible: boolean;
  is_published?: boolean;
  updated_at: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  category?: string | null;
  price_starting_from?: string | null;
  icon: string;
  image_url: string | null;
  image_alt?: string | null;
  display_order: number;
  is_visible: boolean;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  slug: string;
  client_name?: string | null;
  industry?: string | null;
  category: string;
  description: string;
  marketing_objective?: string | null;
  strategy?: string | null;
  services_provided?: string | null;
  project_images?: string[];
  cover_image_url: string | null;
  result_metric: string;
  result_description: string | null;
  case_study_url: string;
  verified_results?: string | null;
  is_featured: boolean;
  is_published: boolean;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type SkillItem = {
  id: string;
  name: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
  is_published?: boolean;
  updated_at?: string;
};

export type ProcessStep = {
  id: string;
  step_number: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
  is_published?: boolean;
  updated_at?: string;
};

export type TestimonialItem = {
  id: string;
  client_name: string;
  business_name?: string | null;
  client_designation: string;
  client_image_url: string | null;
  testimonial: string;
  display_order: number;
  is_visible: boolean;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
};

export type NavigationItem = {
  id: string;
  label: string;
  url: string;
  is_cta: boolean;
  display_order: number;
  is_visible: boolean;
  is_published?: boolean;
  updated_at?: string;
};

export type PublishingHistoryItem = {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  admin_id?: string;
  admin_email?: string;
  action: string;
  section_name?: string;
  section?: string;
  summary?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
};

export type MediaItem = {
  id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  uploaded_at: string;
};

export type PortfolioData = {
  siteSettings: SiteSettings;
  hero: HeroContent;
  about: AboutContent;
  cta?: CtaContent;
  footer?: FooterContent;
  stats: Statistic[];
  services: ServiceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  process: ProcessStep[];
  testimonials: TestimonialItem[];
  sections: PageSection[];
  navigation?: NavigationItem[];
};
