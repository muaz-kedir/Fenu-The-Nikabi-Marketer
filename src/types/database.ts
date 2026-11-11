export type UserRole = 'admin' | 'editor' | 'viewer';

export type SiteSettings = {
  id: string;
  site_name: string;
  owner_name: string;
  professional_title: string;
  email: string;
  phone: string;
  location: string;
  logo_url: string | null;
  favicon_url: string | null;
  profile_image_url: string | null;
  resume_url: string | null;
  instagram_url: string;
  tiktok_url: string;
  linkedin_url: string;
  whatsapp_url: string;
  seo_title: string;
  seo_description: string;
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
  greeting: string;
  full_name: string;
  professional_title: string;
  description: string;
  profile_image_url: string | null;
  background_image_url: string | null;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  updated_at: string;
};

export type AboutContent = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  profile_image_url: string | null;
  additional_description: string | null;
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
  icon: string;
  image_url: string | null;
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
  description: string;
  category: string;
  cover_image_url: string | null;
  result_metric: string;
  result_description: string | null;
  case_study_url: string;
  is_featured: boolean;
  is_published: boolean;
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
};

export type ProcessStep = {
  id: string;
  step_number: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
  is_published?: boolean;
};

export type TestimonialItem = {
  id: string;
  client_name: string;
  client_designation: string;
  client_image_url: string | null;
  testimonial: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: string;
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
  stats: Statistic[];
  services: ServiceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  process: ProcessStep[];
  testimonials: TestimonialItem[];
  sections: PageSection[];
};
