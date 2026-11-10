import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);
const databaseUrl = process.env.DATABASE_URL || '';

const seedPortfolio = {
  siteSettings: {
    id: 'site-settings',
    site_name: 'Fenu Portfolio',
    owner_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Strategist',
    email: 'hello@fenu-portfolio.com',
    phone: '+123456789',
    location: 'Addis Ababa, Ethiopia',
    logo_url: null,
    favicon_url: null,
    profile_image_url: null,
    resume_url: null,
    instagram_url: 'https://instagram.com',
    tiktok_url: 'https://tiktok.com',
    linkedin_url: 'https://linkedin.com',
    whatsapp_url: 'https://wa.me/123456789',
    seo_title: 'Fenu Portfolio',
    seo_description: 'Premium portfolio for a social media marketing specialist.',
    copyright_text: '© 2026 Fenu Portfolio',
    updated_at: new Date().toISOString(),
  },
  hero: {
    id: 'hero',
    greeting: 'Hello, I am',
    full_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Strategist',
    description: 'I help brands grow with strategy, content systems, and creator-first campaigns that actually convert attention into revenue.',
    profile_image_url: null,
    background_image_url: null,
    primary_button_text: 'Book a Call',
    primary_button_url: '#contact',
    secondary_button_text: 'See My Work',
    secondary_button_url: '#work',
    updated_at: new Date().toISOString(),
  },
  about: {
    id: 'about',
    title: 'About Me',
    subtitle: 'Growth marketer & content strategist',
    description: 'I design premium social media systems that turn clarity, creativity, and consistency into measurable business growth.',
    profile_image_url: null,
    additional_description: 'I blend brand storytelling, campaign planning, and data-informed creative direction to help founders scale online.',
    updated_at: new Date().toISOString(),
  },
  stats: [
    { id: 's1', label: 'Campaigns launched', value: '120', suffix: '+', icon: 'rocket', display_order: 1, is_visible: true, updated_at: new Date().toISOString() },
    { id: 's2', label: 'Engagement growth', value: '300', suffix: '%', icon: 'trending', display_order: 2, is_visible: true, updated_at: new Date().toISOString() },
    { id: 's3', label: 'Brands supported', value: '45', suffix: '+', icon: 'users', display_order: 3, is_visible: true, updated_at: new Date().toISOString() },
  ],
  services: [
    { id: 'service-1', title: 'Brand Strategy', description: 'Positioning and channel planning that aligns your brand with the right audience.', icon: 'sparkles', image_url: null, display_order: 1, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'service-2', title: 'Content Systems', description: 'High-converting content calendars and creative systems for consistent execution.', icon: 'pencil', image_url: null, display_order: 2, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'service-3', title: 'Social Growth', description: 'Performance growth plans focused on reach, engagement, and conversion.', icon: 'growth', image_url: null, display_order: 3, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  projects: [
    { id: 'project-1', title: 'Neon Studio Launch', slug: 'neon-studio-launch', description: 'Launch campaign for a wellness brand targetting Gen Z audiences.', category: 'Brand Launch', cover_image_url: null, result_metric: '4.2x', result_description: 'Higher email signups after relaunch', case_study_url: '#', is_featured: true, is_published: true, display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'project-2', title: 'Creator Funnel Revamp', slug: 'creator-funnel-revamp', description: 'Organic-to-paid funnel rebuild for a fast-growing creator studio.', category: 'Growth Strategy', cover_image_url: null, result_metric: '67%', result_description: 'Increase in lead quality', case_study_url: '#', is_featured: true, is_published: true, display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  skills: [
    { id: 'skill-1', name: 'Content Strategy', icon: 'strategy', display_order: 1, is_visible: true },
    { id: 'skill-2', name: 'Social Media Ads', icon: 'ads', display_order: 2, is_visible: true },
    { id: 'skill-3', name: 'Brand Positioning', icon: 'brand', display_order: 3, is_visible: true },
  ],
  process: [
    { id: 'process-1', step_number: '01', title: 'Discovery', description: 'I define goals, audience, offers, and content gaps.', display_order: 1, is_visible: true },
    { id: 'process-2', step_number: '02', title: 'Build', description: 'I create the channel strategy and content framework.', display_order: 2, is_visible: true },
    { id: 'process-3', step_number: '03', title: 'Scale', description: 'I optimize the system based on engagement and conversion signals.', display_order: 3, is_visible: true },
  ],
  testimonials: [
    { id: 'testimonial-1', client_name: 'Selam T.', client_designation: 'Founder, Luma Studio', client_image_url: null, testimonial: 'The strategy and social system changed how we communicated our value. We finally saw a clear sales funnel.', display_order: 1, is_published: true, created_at: new Date().toISOString() },
  ],
  sections: [],
};

const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

app.use(cors());
app.use(express.json());

const localAdminEmail = process.env.LOCAL_ADMIN_EMAIL || 'admin@example.com';
const localAdminPassword = process.env.LOCAL_ADMIN_PASSWORD || 'admin123';

function buildPortfolioPayload(rows) {
  if (!rows || rows.length === 0) {
    return seedPortfolio;
  }

  const data = rows[0]?.portfolio ?? seedPortfolio;
  return data;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: pool ? 'configured' : 'fallback' });
});

app.get('/api/portfolio', async (_req, res) => {
  if (!pool) {
    res.json(seedPortfolio);
    return;
  }

  try {
    const result = await pool.query('SELECT portfolio FROM portfolio_content LIMIT 1');
    res.json(buildPortfolioPayload(result.rows));
  } catch (error) {
    console.error('portfolio query failed:', error);
    res.json(seedPortfolio);
  }
});

app.get('/api/dashboard', async (_req, res) => {
  const payload = {
    totalProjects: 3,
    totalServices: 3,
    totalTestimonials: 1,
    totalMessages: 0,
    unreadMessages: 0,
    publishedProjects: 3,
    hiddenSections: 0,
  };

  if (!pool) {
    res.json(payload);
    return;
  }

  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM projects) AS total_projects,
        (SELECT COUNT(*) FROM services) AS total_services,
        (SELECT COUNT(*) FROM testimonials) AS total_testimonials,
        (SELECT COUNT(*) FROM contact_messages) AS total_messages,
        (SELECT COUNT(*) FROM contact_messages WHERE status <> 'read') AS unread_messages,
        (SELECT COUNT(*) FROM projects WHERE is_published = true) AS published_projects
    `);

    const row = result.rows[0] || {};
    res.json({
      totalProjects: Number(row.total_projects || 0),
      totalServices: Number(row.total_services || 0),
      totalTestimonials: Number(row.total_testimonials || 0),
      totalMessages: Number(row.total_messages || 0),
      unreadMessages: Number(row.unread_messages || 0),
      publishedProjects: Number(row.published_projects || 0),
      hiddenSections: 0,
    });
  } catch (error) {
    console.error('dashboard query failed:', error);
    res.json(payload);
  }
});

app.get('/api/contact-messages', async (_req, res) => {
  if (!pool) {
    res.json([]);
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('contact messages query failed:', error);
    res.json([]);
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  if (email !== localAdminEmail || password !== localAdminPassword) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  res.json({
    user: {
      id: 'local-admin',
      email,
      role: 'admin',
    },
    session: {
      user: { id: 'local-admin', email, role: 'admin' },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  });
});

app.post('/api/admin/logout', (_req, res) => {
  res.json({ ok: true });
});

export default app;
