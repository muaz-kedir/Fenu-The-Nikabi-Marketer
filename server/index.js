import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Ensure .env is read from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);
const uploadsDir = path.join(process.cwd(), 'uploads');
const localContactMessagesPath = path.join(process.cwd(), '.local-data', 'contact-messages.json');
const localTestimonialsPath = path.join(process.cwd(), '.local-data', 'testimonials.json');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fenu-portfolio-secure-admin-token-secret-2026';
const adminTokens = new Map();
const revokedTokens = new Set();

const localAdminEmail = (process.env.ADMIN_EMAIL || process.env.LOCAL_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
const localAdminPassword = process.env.ADMIN_PASSWORD || process.env.LOCAL_ADMIN_PASSWORD || 'admin123';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  try {
    if (stored.includes(':')) {
      const [salt, key] = stored.split(':');
      if (!salt || !key) return false;
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    }
    // Safe constant-time fallback for plain string comparison
    const hashA = crypto.createHash('sha256').update(String(password)).digest();
    const hashB = crypto.createHash('sha256').update(String(stored)).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

let pool = null;

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
      if (parsed.DATABASE_URL) {
        process.env.DATABASE_URL = parsed.DATABASE_URL;
        return parsed.DATABASE_URL;
      }
    }
  } catch (err) {
    console.error('Error reading .env for DATABASE_URL:', err);
  }
  return '';
}

function getPool() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) return null;
  if (!pool) {
    try {
      const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
      pool = new Pool({
        connectionString: dbUrl,
        ssl: isLocalhost ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10,
      });
      pool.on('error', (err) => {
        console.error('Unexpected error on idle pg client:', err);
      });
    } catch (err) {
      console.error('Failed to initialize pg pool:', err);
      pool = null;
    }
  }
  return pool;
}

function signToken(user, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = {
    user,
    exp: Date.now() + expiresInMs,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  if (revokedTokens.has(token)) return null;
  
  // 1. Verify HMAC signed token
  const dotIndex = token.indexOf('.');
  if (dotIndex > 0) {
    const payloadB64 = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);
    try {
      const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
      if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
        if (payload.exp && payload.exp > Date.now()) {
          return payload.user;
        }
      }
    } catch {
      // Signature or JSON parsing failed
    }
  }

  // 2. In-memory session fallback
  const session = adminTokens.get(token);
  if (session && session.expiresAt > Date.now()) {
    return session.user;
  }

  return null;
}

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.use(express.json({ limit: '25mb' }));

// Uploads serving: static file if exists, database fallback if container restarted
app.use('/uploads', async (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const relativePath = decodeURIComponent(req.path.replace(/^\//, ''));
  const filePath = path.join(uploadsDir, relativePath);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Fallback to database if ephemeral container storage was wiped
  try {
    const fileUrl = `/uploads/${relativePath}`;
    const media = await query(
      'SELECT file_name, file_type, data_url FROM media_items WHERE file_url = $1 OR storage_path = $2 LIMIT 1',
      [fileUrl, relativePath]
    );

    if (media.rows.length > 0 && media.rows[0].data_url) {
      const base64Data = media.rows[0].data_url.split(',')[1];
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        try {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, buffer);
        } catch {
          // ignore disk cache write errors
        }
        res.setHeader('Content-Type', media.rows[0].file_type || 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }
    }
  } catch (err) {
    console.error('[uploads DB fallback error]:', err.message);
  }

  res.status(404).send('Image not found');
});

function ok(res, data) {
  res.json(data);
}

function fail(res, status, message) {
  res.status(status).json({ message });
}

function readLocalContactMessages() {
  if (!fs.existsSync(localContactMessagesPath)) return [];
  const messages = JSON.parse(fs.readFileSync(localContactMessagesPath, 'utf8'));
  if (!Array.isArray(messages)) return [];
  return messages;
}

function writeLocalContactMessages(messages) {
  fs.mkdirSync(path.dirname(localContactMessagesPath), { recursive: true });
  const temporaryPath = `${localContactMessagesPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(messages, null, 2));
  fs.renameSync(temporaryPath, localContactMessagesPath);
}

function readLocalTestimonials() {
  if (!fs.existsSync(localTestimonialsPath)) return [];
  const testimonials = JSON.parse(fs.readFileSync(localTestimonialsPath, 'utf8'));
  if (!Array.isArray(testimonials)) return [];
  return testimonials;
}

function writeLocalTestimonials(testimonials) {
  fs.mkdirSync(path.dirname(localTestimonialsPath), { recursive: true });
  const temporaryPath = `${localTestimonialsPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(testimonials, null, 2));
  fs.renameSync(temporaryPath, localTestimonialsPath);
}

let schemaInitialized = false;
async function ensureDatabaseSchema() {
  if (schemaInitialized) return;
  const activePool = getPool();
  if (!activePool) return;

  try {
    // 1. Check if core tables exist (e.g. hero_content)
    const checkRes = await activePool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hero_content'
      );
    `);

    const tablesExist = checkRes.rows[0]?.exists;
    if (!tablesExist) {
      console.log('[db] Core tables missing. Applying database/schema.sql...');
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await activePool.query(schemaSql);
        console.log('[db] Schema applied successfully.');
      } else {
        console.error('[db] schema.sql not found at:', schemaPath);
      }

      const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        console.log('[db] Applying database/seed.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await activePool.query(seedSql);
        console.log('[db] Seed data applied successfully.');
      }
    }

    // 2. Ensure admin_users exists and is seeded
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(LOWER(email));
    `);

    const res = await activePool.query('SELECT COUNT(*) FROM admin_users');
    if (Number(res.rows[0].count) === 0) {
      const defaultEmail = (process.env.ADMIN_EMAIL || process.env.LOCAL_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
      const defaultPass = process.env.ADMIN_PASSWORD || process.env.LOCAL_ADMIN_PASSWORD || 'admin123';
      const hashed = hashPassword(defaultPass);
      await activePool.query(
        'INSERT INTO admin_users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [defaultEmail, hashed, 'admin']
      );
      console.log(`[auth] Initialized admin user (${defaultEmail}) in database.`);
    }

    // 3. Ensure CMS expansion tables and columns exist (migration 004)
    const navExists = await activePool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'navigation_items'
      );
    `);
    if (!navExists.rows[0]?.exists) {
      console.log('[db] Applying migration 004_cms_expansion.sql...');
      const migPath = path.join(process.cwd(), 'database', 'migrations', '004_cms_expansion.sql');
      if (fs.existsSync(migPath)) {
        const migSql = fs.readFileSync(migPath, 'utf8');
        await activePool.query(migSql);
        console.log('[db] 004_cms_expansion.sql applied successfully.');
      }
    }

    // 4. Ensure media persistence and alt text columns exist unconditionally
    try {
      await activePool.query(`
        ALTER TABLE media_items ADD COLUMN IF NOT EXISTS data_url TEXT;
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS profile_image_alt TEXT;
        ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS profile_image_alt TEXT;
        ALTER TABLE about_content ADD COLUMN IF NOT EXISTS profile_image_alt TEXT;
        ALTER TABLE services ADD COLUMN IF NOT EXISTS image_alt TEXT;
      `);
      console.log('[db] Media persistence and alt text schema verified.');
    } catch (migErr) {
      console.warn('[db] Note on schema alterations:', migErr.message);
    }

    schemaInitialized = true;
  } catch (err) {
    console.error('[db] Error initializing database schema:', err.message);
  }
}

async function query(text, params = []) {
  const activePool = getPool();
  if (!activePool) throw new Error('Database is not configured. Please ensure DATABASE_URL is set in .env');
  if (!schemaInitialized) {
    await ensureDatabaseSchema();
  }
  return activePool.query(text, params);
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = verifyToken(token);
  if (!token || !user) {
    fail(res, 401, 'Authentication required. Your session may have expired.');
    return;
  }
  req.admin = user;
  req.user = user;
  next();
}

function slugify(value) {
  return (
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

const seedPortfolio = {
  siteSettings: {
    id: 'seed-site',
    is_published: true,
    site_name: 'Azmina Zahra',
    owner_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Specialist',
    email: 'hello@azminazahra.com',
    phone: '+971 52 123 4567',
    location: 'Dubai, UAE',
    logo_url: null,
    favicon_url: null,
    profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    profile_image_alt: 'Azmina Zahra portrait',
    resume_url: null,
    instagram_url: 'https://instagram.com',
    tiktok_url: 'https://tiktok.com',
    linkedin_url: 'https://linkedin.com',
    whatsapp_url: 'https://wa.me/971521234567',
    seo_title: 'Azmina Zahra | Social Media Marketing Specialist',
    seo_description: 'Premium social media marketing strategy and creative services for brands ready to grow.',
    copyright_text: '© 2025 Azmina Zahra. All rights reserved.',
    updated_at: new Date().toISOString(),
  },
  hero: {
    id: 'seed-hero',
    is_published: true,
    greeting: "Hello, I'm",
    full_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Specialist',
    description:
      'I help brands turn attention into action with strategic content, story-led campaigns, and performance-driven growth systems.',
    profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    profile_image_alt: 'Azmina Zahra',
    background_image_url: null,
    primary_button_text: 'View My Work',
    primary_button_url: '#work',
    secondary_button_text: "Let's Work Together",
    secondary_button_url: '#contact',
    updated_at: new Date().toISOString(),
  },
  about: {
    id: 'seed-about',
    is_published: true,
    title: 'A brand storyteller with strategy in her DNA.',
    subtitle: 'About Me',
    description:
      'I design thoughtful marketing experiences that connect with people, elevate brands, and turn engagement into measurable results.',
    profile_image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
    profile_image_alt: 'About Azmina Zahra',
    additional_description:
      'I partner with founders and growing brands to build modern, people-first digital marketing systems that feel premium and perform in real life.',
    updated_at: new Date().toISOString(),
  },
  cta: {
    id: 'seed-cta',
    is_published: true,
    script_greeting: 'Thank you for your support!',
    main_heading: 'Ready to grow your brand?',
    supporting_description:
      "Let's focus on building and growing your presence with strategy, creativity, and performance that feels premium from day one.",
    highlighted_words: 'building,growing',
    button_text: 'Contact Me',
    button_url: 'https://wa.me/971521234567',
    updated_at: new Date().toISOString(),
  },
  footer: {
    id: 'seed-footer',
    is_published: true,
    copyright_text: '© 2025 Azmina Zahra. All rights reserved.',
    email: 'hello@azminazahra.com',
    phone: '+971 52 123 4567',
    instagram_url: 'https://instagram.com',
    tiktok_url: 'https://tiktok.com',
    linkedin_url: 'https://linkedin.com',
    whatsapp_url: 'https://wa.me/971521234567',
    footer_description: 'Premium social media marketing strategy and creative services.',
    updated_at: new Date().toISOString(),
  },
  stats: [],
  services: [],
  projects: [],
  skills: [],
  process: [],
  testimonials: [],
  sections: [],
};

async function buildPortfolio(previewDraft = false) {
  if (!getPool()) {
    return {
      ...seedPortfolio,
      testimonials: readLocalTestimonials()
        .filter((testimonial) => testimonial.is_published)
        .sort((a, b) => a.display_order - b.display_order),
    };
  }

  const singletonOrder = previewDraft ? 'is_published ASC, updated_at DESC' : 'updated_at DESC';
  const singletonFilter = previewDraft ? 'TRUE' : 'is_published = TRUE';
  const collectionFilter = previewDraft ? 'is_visible = TRUE' : 'is_published = TRUE AND is_visible = TRUE';
  const sectionsFilter = previewDraft ? 'TRUE' : 'is_published = TRUE';

  const safeQuery = async (sql, fallback = []) => {
    try {
      const res = await query(sql);
      return res.rows;
    } catch (err) {
      console.error(`[buildPortfolio query failed]: ${sql} -> ${err.message}`);
      return fallback;
    }
  };

  try {
    const [
      siteRows,
      heroRows,
      aboutRows,
      ctaRows,
      footerRows,
      statsRows,
      servicesRows,
      projectsRows,
      skillsRows,
      processRows,
      testimonialsRows,
      sectionsRows,
      navigationRows,
    ] = await Promise.all([
      safeQuery(`SELECT * FROM site_settings WHERE ${singletonFilter} ORDER BY ${singletonOrder} LIMIT 1`),
      safeQuery(`SELECT * FROM hero_content WHERE ${singletonFilter} ORDER BY ${singletonOrder} LIMIT 1`),
      safeQuery(`SELECT * FROM about_content WHERE ${singletonFilter} ORDER BY ${singletonOrder} LIMIT 1`),
      safeQuery(`SELECT * FROM cta_content WHERE ${singletonFilter} ORDER BY ${singletonOrder} LIMIT 1`),
      safeQuery(`SELECT * FROM footer_content WHERE ${singletonFilter} ORDER BY ${singletonOrder} LIMIT 1`),
      safeQuery(`SELECT * FROM statistics WHERE ${collectionFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM services WHERE ${collectionFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM projects WHERE ${collectionFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM skills WHERE ${collectionFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM process_steps WHERE ${collectionFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM testimonials WHERE ${collectionFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM page_sections WHERE ${sectionsFilter} ORDER BY display_order, id`),
      safeQuery(`SELECT * FROM navigation_items WHERE ${collectionFilter} ORDER BY display_order, id`),
    ]);

    // If published row was not found, fallback to any existing row in DB before seed
    const activeSite = siteRows[0] || (await safeQuery('SELECT * FROM site_settings ORDER BY updated_at DESC LIMIT 1'))[0] || seedPortfolio.siteSettings;
    const activeHero = heroRows[0] || (await safeQuery('SELECT * FROM hero_content ORDER BY updated_at DESC LIMIT 1'))[0] || seedPortfolio.hero;
    const activeAbout = aboutRows[0] || (await safeQuery('SELECT * FROM about_content ORDER BY updated_at DESC LIMIT 1'))[0] || seedPortfolio.about;
    const activeCta = ctaRows[0] || (await safeQuery('SELECT * FROM cta_content ORDER BY updated_at DESC LIMIT 1'))[0] || seedPortfolio.cta;
    const activeFooter = footerRows[0] || (await safeQuery('SELECT * FROM footer_content ORDER BY updated_at DESC LIMIT 1'))[0] || seedPortfolio.footer;

    const activeStats = statsRows.length > 0 ? statsRows : (await safeQuery('SELECT * FROM statistics ORDER BY display_order, id'));
    const activeServices = servicesRows.length > 0 ? servicesRows : (await safeQuery('SELECT * FROM services ORDER BY display_order, id'));
    const activeProjects = projectsRows.length > 0 ? projectsRows : (await safeQuery('SELECT * FROM projects ORDER BY display_order, id'));
    const activeSkills = skillsRows.length > 0 ? skillsRows : (await safeQuery('SELECT * FROM skills ORDER BY display_order, id'));
    const activeProcess = processRows.length > 0 ? processRows : (await safeQuery('SELECT * FROM process_steps ORDER BY display_order, id'));
    const activeTestimonials = testimonialsRows.length > 0 ? testimonialsRows : (await safeQuery('SELECT * FROM testimonials ORDER BY display_order, id'));

    return {
      siteSettings: activeSite,
      hero: activeHero,
      about: activeAbout,
      cta: activeCta,
      footer: activeFooter,
      stats: activeStats,
      services: activeServices,
      projects: activeProjects,
      skills: activeSkills,
      process: activeProcess,
      testimonials: activeTestimonials,
      sections: sectionsRows,
      navigation: navigationRows,
    };
  } catch (error) {
    console.error('buildPortfolio uncaught error:', error);
    return seedPortfolio;
  }
}

app.get('/api/health', async (_req, res) => {
  let dbStatus = 'unconfigured';
  if (getPool()) {
    try {
      await query('SELECT 1');
      dbStatus = 'connected';
    } catch (err) {
      dbStatus = `disconnected (${err.message})`;
    }
  }
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/portfolio', async (req, res) => {
  const isPreview = req.query.preview === 'true';
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json(await buildPortfolio(isPreview));
});

app.get('/api/dashboard', async (_req, res) => {
  const fallback = {
    totalProjects: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalMessages: 0,
    unreadMessages: 0,
    publishedProjects: 0,
    hiddenSections: 0,
    publishedSections: 0,
    totalSkills: 0,
    totalProcessSteps: 0,
    totalMedia: 0,
    draftChanges: 0,
    lastPublishedAt: null,
    recentActivities: [],
  };
  if (!getPool()) {
    try {
      const messages = readLocalContactMessages();
      res.json({
        ...fallback,
        totalMessages: messages.length,
        unreadMessages: messages.filter((message) => message.status !== 'read').length,
        totalTestimonials: readLocalTestimonials().length,
      });
    } catch (error) {
      console.error('local contact messages read failed:', error);
      fail(res, 500, 'Failed to load dashboard data.');
    }
    return;
  }
  try {
    const [countsRes, historyRes] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*) FROM projects) AS total_projects,
          (SELECT COUNT(*) FROM services) AS total_services,
          (SELECT COUNT(*) FROM testimonials) AS total_testimonials,
          (SELECT COUNT(*) FROM contact_messages) AS total_messages,
          (SELECT COUNT(*) FROM contact_messages WHERE status <> 'read') AS unread_messages,
          (SELECT COUNT(*) FROM projects WHERE is_published = TRUE AND is_visible = TRUE) AS published_projects,
          (SELECT COUNT(*) FROM page_sections WHERE is_visible = FALSE) AS hidden_sections,
          (SELECT COUNT(*) FROM page_sections WHERE is_visible = TRUE AND is_published = TRUE) AS published_sections,
          (SELECT COUNT(*) FROM skills) AS total_skills,
          (SELECT COUNT(*) FROM process_steps) AS total_process_steps,
          (SELECT COUNT(*) FROM media_items) AS total_media,
          (
            (SELECT COUNT(*) FROM hero_content WHERE is_published = FALSE) +
            (SELECT COUNT(*) FROM about_content WHERE is_published = FALSE) +
            (SELECT COUNT(*) FROM site_settings WHERE is_published = FALSE) +
            (SELECT COUNT(*) FROM projects WHERE is_published = FALSE) +
            (SELECT COUNT(*) FROM services WHERE is_published = FALSE) +
            (SELECT COUNT(*) FROM testimonials WHERE is_published = FALSE) +
            (SELECT COUNT(*) FROM navigation_items WHERE is_published = FALSE)
          ) AS draft_changes,
          (SELECT MAX(created_at) FROM publishing_history WHERE action = 'publish') AS last_published_at
      `),
      query('SELECT * FROM publishing_history ORDER BY created_at DESC LIMIT 5').catch(() => ({ rows: [] }))
    ]);

    const row = countsRes.rows[0] || {};
    res.json({
      totalProjects: Number(row.total_projects || 0),
      totalServices: Number(row.total_services || 0),
      totalTestimonials: Number(row.total_testimonials || 0),
      totalMessages: Number(row.total_messages || 0),
      unreadMessages: Number(row.unread_messages || 0),
      publishedProjects: Number(row.published_projects || 0),
      hiddenSections: Number(row.hidden_sections || 0),
      publishedSections: Number(row.published_sections || 0),
      totalSkills: Number(row.total_skills || 0),
      totalProcessSteps: Number(row.total_process_steps || 0),
      totalMedia: Number(row.total_media || 0),
      draftChanges: Number(row.draft_changes || 0),
      lastPublishedAt: row.last_published_at || null,
      recentActivities: historyRes.rows || [],
    });
  } catch (error) {
    console.error('dashboard query failed:', error);
    res.json(fallback);
  }
});

// Auth
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    fail(res, 400, 'Email and password are required.');
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  let authenticatedUser = null;

  // 1. Try database admin user if DB is connected
  if (getPool()) {
    try {
      await ensureDatabaseSchema();
      const result = await query(
        'SELECT id, email, password_hash, role FROM admin_users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        if (verifyPassword(password, row.password_hash)) {
          authenticatedUser = { id: row.id, email: row.email, role: row.role || 'admin' };
        }
      }
    } catch (err) {
      console.error('Database authentication check failed:', err.message);
    }
  }

  // 2. Fallback to configured environment credentials if not in database
  if (!authenticatedUser) {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || process.env.LOCAL_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const configuredAdminPassword = process.env.ADMIN_PASSWORD || process.env.LOCAL_ADMIN_PASSWORD || 'admin123';

    if (normalizedEmail === configuredAdminEmail && verifyPassword(password, configuredAdminPassword)) {
      authenticatedUser = { id: 'admin-primary', email: configuredAdminEmail, role: 'admin' };
    }
  }

  if (!authenticatedUser) {
    fail(res, 401, 'Invalid email or password.');
    return;
  }

  const token = signToken(authenticatedUser, 7 * 24 * 60 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  adminTokens.set(token, { user: authenticatedUser, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  ok(res, {
    user: authenticatedUser,
    session: { user: authenticatedUser, expiresAt },
    token,
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token) {
    adminTokens.delete(token);
    revokedTokens.add(token);
  }
  ok(res, { ok: true, message: 'Successfully logged out.' });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  ok(res, { user: req.admin });
});

function sanitizeSingletonPayload(table, payload) {
  const data = { ...payload };
  if (data.is_visible === undefined || data.is_visible === null) data.is_visible = true;
  if (data.display_order === undefined || data.display_order === null) data.display_order = 0;

  if (table === 'hero_content') {
    if (!data.greeting) data.greeting = "Hello, I'm";
    if (!data.full_name) data.full_name = 'Azmina Zahra';
    if (!data.professional_title) data.professional_title = 'Social Media Marketing Specialist';
    if (!data.description) data.description = '';
    if (!data.primary_button_text) data.primary_button_text = 'View My Work';
    if (!data.primary_button_url) data.primary_button_url = '#work';
  } else if (table === 'about_content') {
    if (!data.title) data.title = 'About Me';
    if (!data.description) data.description = '';
    if (data.experience_years === undefined || data.experience_years === null) data.experience_years = 5;
  } else if (table === 'site_settings') {
    if (!data.site_name) data.site_name = 'Azmina Zahra';
    if (!data.owner_name) data.owner_name = 'Azmina Zahra';
    if (!data.professional_title) data.professional_title = 'Social Media Marketing Specialist';
    if (!data.email) data.email = 'hello@azminazahra.com';
    if (data.announcement_active === undefined || data.announcement_active === null) data.announcement_active = false;
  }
  return data;
}

// Generic helpers for singleton tables (draft/publish system)
function singletonRoutes(table, columns) {
  app.get(`/api/admin/${table}`, requireAdmin, async (_req, res) => {
    try {
      const result = await query(`SELECT * FROM ${table} ORDER BY is_published DESC, updated_at DESC`);
      const published = result.rows.find((row) => row.is_published) || null;
      const draft = result.rows.find((row) => !row.is_published) || null;
      ok(res, { published, draft, items: result.rows });
    } catch (error) {
      console.error(`Error fetching admin ${table}:`, error);
      fail(res, 500, error.message || 'Failed to load content.');
    }
  });

  const handleSaveSingleton = async (req, res) => {
    try {
      const isPublished = req.body.is_published === true;
      const fields = columns;
      const sanitized = sanitizeSingletonPayload(table, req.body || {});
      const existing = await query(`SELECT id FROM ${table} WHERE is_published = $1 ORDER BY updated_at DESC LIMIT 1`, [
        isPublished,
      ]);
      const values = fields.map((field) => sanitized[field] ?? null);
      let targetId;
      if (existing.rows[0]) {
        targetId = existing.rows[0].id;
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [
          targetId,
          ...values,
        ]);
      } else {
        const placeholders = fields.map((_, index) => `$${index + 2}`).join(', ');
        const result = await query(
          `INSERT INTO ${table} (is_published, ${fields.join(', ')}) VALUES ($1, ${placeholders}) RETURNING id`,
          [isPublished, ...values],
        );
        targetId = result.rows[0].id;
      }

      // If saving directly as published, also sync the draft row so draft doesn't hold stale or reverted data!
      if (isPublished) {
        const draft = await query(`SELECT id FROM ${table} WHERE is_published = FALSE ORDER BY updated_at DESC LIMIT 1`);
        if (draft.rows[0]) {
          const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
          await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [draft.rows[0].id, ...values]);
        }
      }

      ok(res, { id: targetId, updated: true, is_published: isPublished });
    } catch (error) {
      console.error(`Error saving admin ${table}:`, error);
      fail(res, 500, error.message || 'Failed to save content.');
    }
  };

  app.post(`/api/admin/${table}`, requireAdmin, handleSaveSingleton);
  app.put(`/api/admin/${table}`, requireAdmin, handleSaveSingleton);
  app.patch(`/api/admin/${table}`, requireAdmin, handleSaveSingleton);

  app.post(`/api/admin/${table}/publish`, requireAdmin, async (req, res) => {
    try {
      const fields = columns;
      const hasPayload = fields.some((f) => req.body && req.body[f] !== undefined);

      if (hasPayload) {
        const sanitized = sanitizeSingletonPayload(table, req.body || {});
        const values = fields.map((field) => sanitized[field] ?? null);
        const published = await query(`SELECT id FROM ${table} WHERE is_published = TRUE ORDER BY updated_at DESC LIMIT 1`);
        if (published.rows[0]) {
          const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
          await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [published.rows[0].id, ...values]);
        } else {
          const placeholders = fields.map((_, index) => `$${index + 2}`).join(', ');
          await query(`INSERT INTO ${table} (is_published, ${fields.join(', ')}) VALUES ($1, ${placeholders})`, [true, ...values]);
        }
        // Also update draft so draft and published stay strictly synchronized
        const draft = await query(`SELECT id FROM ${table} WHERE is_published = FALSE ORDER BY updated_at DESC LIMIT 1`);
        if (draft.rows[0]) {
          const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
          await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [draft.rows[0].id, ...values]);
        }
        ok(res, { published: true });
        return;
      }

      // If no payload passed, safely resolve between published and draft
      const draft = await query(`SELECT * FROM ${table} WHERE is_published = FALSE ORDER BY updated_at DESC LIMIT 1`);
      const published = await query(`SELECT * FROM ${table} WHERE is_published = TRUE ORDER BY updated_at DESC LIMIT 1`);

      if (!draft.rows[0] && !published.rows[0]) {
        fail(res, 404, 'No content to publish.');
        return;
      }

      // If published exists and is newer than or equal to draft, keep published as-is and sync draft
      if (published.rows[0] && draft.rows[0]) {
        const publishedTime = new Date(published.rows[0].updated_at).getTime();
        const draftTime = new Date(draft.rows[0].updated_at).getTime();
        if (publishedTime >= draftTime) {
          const row = sanitizeSingletonPayload(table, published.rows[0]);
          const values = fields.map((field) => row[field] ?? null);
          const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
          await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [draft.rows[0].id, ...values]);
          ok(res, { published: true, message: 'Published content is up to date.' });
          return;
        }
      }

      // Draft is newer: copy draft to published
      const sourceRow = draft.rows[0] || published.rows[0];
      const row = sanitizeSingletonPayload(table, sourceRow);
      const values = fields.map((field) => row[field] ?? null);

      if (published.rows[0]) {
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [
          published.rows[0].id,
          ...values,
        ]);
      } else {
        const placeholders = fields.map((_, index) => `$${index + 2}`).join(', ');
        await query(`INSERT INTO ${table} (is_published, ${fields.join(', ')}) VALUES ($1, ${placeholders})`, [
          true,
          ...values,
        ]);
      }
      ok(res, { published: true });
    } catch (error) {
      console.error(`Error publishing admin ${table}:`, error);
      fail(res, 500, error.message || 'Failed to publish content.');
    }
  });
}

singletonRoutes('site_settings', [
  'site_name',
  'owner_name',
  'professional_title',
  'email',
  'phone',
  'location',
  'logo_url',
  'favicon_url',
  'profile_image_url',
  'profile_image_alt',
  'resume_url',
  'instagram_url',
  'tiktok_url',
  'linkedin_url',
  'whatsapp_url',
  'facebook_url',
  'booking_url',
  'announcement_text',
  'announcement_active',
  'brand_primary_color',
  'brand_accent_color',
  'contact_heading',
  'contact_description',
  'seo_title',
  'seo_description',
  'keywords',
  'og_title',
  'og_description',
  'og_image_url',
  'canonical_url',
  'copyright_text',
]);

singletonRoutes('hero_content', [
  'greeting',
  'full_name',
  'professional_title',
  'subtitle',
  'description',
  'profile_image_url',
  'profile_image_alt',
  'background_image_url',
  'primary_button_text',
  'primary_button_url',
  'secondary_button_text',
  'secondary_button_url',
  'availability_status',
  'is_visible',
  'display_order',
]);

singletonRoutes('about_content', [
  'title',
  'subtitle',
  'intro_heading',
  'description',
  'profile_image_url',
  'profile_image_alt',
  'experience_years',
  'additional_description',
  'is_visible',
]);

singletonRoutes('cta_content', [
  'script_greeting',
  'main_heading',
  'supporting_description',
  'highlighted_words',
  'button_text',
  'button_url',
]);

singletonRoutes('footer_content', [
  'copyright_text',
  'email',
  'phone',
  'instagram_url',
  'tiktok_url',
  'linkedin_url',
  'whatsapp_url',
  'footer_description',
]);

// Collection routes factory
function collectionRoutes(resource, table, columns) {
  app.get(`/api/admin/${resource}`, requireAdmin, async (_req, res) => {
    try {
      if (!getPool() && resource === 'testimonials') {
        ok(res, readLocalTestimonials().sort((a, b) => a.display_order - b.display_order));
        return;
      }
      const result = await query(`SELECT * FROM ${table} ORDER BY display_order, id`);
      ok(res, result.rows);
    } catch (error) {
      console.error(`Error loading admin ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to load records.');
    }
  });

  app.post(`/api/admin/${resource}`, requireAdmin, async (req, res) => {
    try {
      const fields = columns;
      if (!getPool() && resource === 'testimonials') {
        const testimonial = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...Object.fromEntries(
            fields.map((field) => [
              field,
              req.body[field] !== undefined
                ? req.body[field]
                : field === 'is_published' || field.startsWith('is_')
                  ? true
                  : field === 'display_order'
                    ? 0
                    : null,
            ]),
          ),
        };
        writeLocalTestimonials([testimonial, ...readLocalTestimonials()]);
        ok(res, { id: testimonial.id, created: true });
        return;
      }
      const values = fields.map((field) => {
        if (field === 'slug' && !req.body.slug) return slugify(req.body.title || req.body.name);
        if (req.body[field] !== undefined) return req.body[field];
        if (field === 'is_featured') return false;
        if (field.startsWith('is_')) return true;
        if (field === 'display_order') return 0;
        return null;
      });
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
      const result = await query(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      ok(res, result.rows[0]);
    } catch (error) {
      console.error(`Error creating in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to create record.');
    }
  });

  app.post(`/api/admin/${resource}/publish-all`, requireAdmin, async (_req, res) => {
    try {
      await query(`UPDATE ${table} SET is_published = TRUE, updated_at = NOW()`);
      ok(res, { published: true });
    } catch (error) {
      console.error(`Error publishing all in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to publish records.');
    }
  });

  app.put(`/api/admin/${resource}/reorder`, requireAdmin, async (req, res) => {
    try {
      const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
      if (!getPool() && resource === 'testimonials') {
        const orderById = new Map(ids.map((id, index) => [id, index + 1]));
        writeLocalTestimonials(
          readLocalTestimonials().map((t) =>
            orderById.has(t.id) ? { ...t, display_order: orderById.get(t.id) } : t,
          ),
        );
        ok(res, { reordered: true });
        return;
      }
      for (let index = 0; index < ids.length; index += 1) {
        await query(`UPDATE ${table} SET display_order = $1, updated_at = NOW() WHERE id = $2`, [
          index + 1,
          ids[index],
        ]);
      }
      ok(res, { reordered: true });
    } catch (error) {
      console.error(`Error reordering in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to reorder records.');
    }
  });

  app.put(`/api/admin/${resource}/:id`, requireAdmin, async (req, res) => {
    try {
      const fields = columns;
      if (!getPool() && resource === 'testimonials') {
        const testimonials = readLocalTestimonials();
        const existing = testimonials.find((testimonial) => testimonial.id === req.params.id);
        if (!existing) {
          fail(res, 404, 'Testimonial not found.');
          return;
        }
        const updated = {
          ...existing,
          ...Object.fromEntries(
            fields.map((field) => [
              field,
              req.body[field] !== undefined
                ? req.body[field]
                : field === 'is_published' || field.startsWith('is_')
                  ? true
                  : field === 'display_order'
                    ? 0
                    : null,
            ]),
          ),
        };
        writeLocalTestimonials(testimonials.map((t) => (t.id === req.params.id ? updated : t)));
        ok(res, { id: req.params.id, updated: true });
        return;
      }
      const values = fields.map((field) => {
        if (req.body[field] !== undefined) return req.body[field];
        if (field === 'is_featured') return false;
        if (field.startsWith('is_')) return true;
        if (field === 'display_order') return 0;
        return null;
      });
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const result = await query(
        `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id, ...values],
      );
      ok(res, result.rows[0] || { id: req.params.id, updated: true });
    } catch (error) {
      console.error(`Error updating in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to update record.');
    }
  });

  app.delete(`/api/admin/${resource}/:id`, requireAdmin, async (req, res) => {
    try {
      if (!getPool() && resource === 'testimonials') {
        writeLocalTestimonials(readLocalTestimonials().filter((t) => t.id !== req.params.id));
        ok(res, { deleted: true });
        return;
      }
      await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      ok(res, { deleted: true });
    } catch (error) {
      console.error(`Error deleting in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to delete record.');
    }
  });

  app.post(`/api/admin/${resource}/:id/publish`, requireAdmin, async (req, res) => {
    try {
      await query(`UPDATE ${table} SET is_published = TRUE, updated_at = NOW() WHERE id = $1`, [req.params.id]);
      ok(res, { published: true });
    } catch (error) {
      console.error(`Error publishing in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to publish record.');
    }
  });

  app.post(`/api/admin/${resource}/:id/unpublish`, requireAdmin, async (req, res) => {
    try {
      await query(`UPDATE ${table} SET is_published = FALSE, updated_at = NOW() WHERE id = $1`, [req.params.id]);
      ok(res, { published: false });
    } catch (error) {
      console.error(`Error unpublishing in ${resource}:`, error);
      fail(res, 500, error.message || 'Failed to unpublish record.');
    }
  });
}

collectionRoutes('statistics', 'statistics', [
  'is_published',
  'is_visible',
  'label',
  'value',
  'suffix',
  'icon',
  'display_order',
]);

collectionRoutes('services', 'services', [
  'is_published',
  'is_visible',
  'title',
  'description',
  'category',
  'price_starting_from',
  'icon',
  'image_url',
  'image_alt',
  'display_order',
]);

collectionRoutes('projects', 'projects', [
  'is_published',
  'is_visible',
  'is_featured',
  'title',
  'slug',
  'client_name',
  'industry',
  'description',
  'marketing_objective',
  'strategy',
  'services_provided',
  'category',
  'cover_image_url',
  'project_images',
  'verified_results',
  'result_metric',
  'result_description',
  'case_study_url',
  'display_order',
]);

collectionRoutes('skills', 'skills', [
  'is_published',
  'is_visible',
  'name',
  'icon',
  'display_order',
]);

collectionRoutes('process', 'process_steps', [
  'is_published',
  'is_visible',
  'step_number',
  'title',
  'description',
  'display_order',
]);

collectionRoutes('testimonials', 'testimonials', [
  'is_published',
  'is_visible',
  'client_name',
  'business_name',
  'client_designation',
  'client_image_url',
  'testimonial',
  'display_order',
]);

collectionRoutes('navigation', 'navigation_items', [
  'is_published',
  'is_visible',
  'label',
  'url',
  'is_cta',
  'display_order',
]);

collectionRoutes('sections', 'page_sections', [
  'is_published',
  'section_key',
  'title',
  'subtitle',
  'description',
  'is_visible',
  'display_order',
]);

// Publishing history & global publish
app.get('/api/admin/history', requireAdmin, async (_req, res) => {
  try {
    const result = await query('SELECT * FROM publishing_history ORDER BY created_at DESC LIMIT 50');
    ok(res, result.rows);
  } catch (error) {
    console.error('Error fetching publishing history:', error);
    fail(res, 500, error.message || 'Failed to load publishing history.');
  }
});

app.post('/api/admin/history', requireAdmin, async (req, res) => {
  try {
    const { action, section, summary, details } = req.body || {};
    const adminId = String(req.user?.id || 'admin');
    const adminEmail = req.user?.email || 'admin@example.com';
    const payloadDetails = details || (summary ? { summary } : null);
    const result = await query(
      'INSERT INTO publishing_history (admin_id, admin_email, action, section, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [adminId, adminEmail, action || 'publish', section || 'all', payloadDetails ? JSON.stringify(payloadDetails) : null]
    );
    ok(res, result.rows[0]);
  } catch (error) {
    console.error('Error recording publishing history:', error);
    fail(res, 500, error.message || 'Failed to record history.');
  }
});

app.post('/api/admin/publish-all-drafts', requireAdmin, async (req, res) => {
  try {
    const singletons = ['hero_content', 'about_content', 'site_settings', 'cta_content', 'footer_content'];
    for (const table of singletons) {
      const draft = await query(`SELECT * FROM ${table} WHERE is_published = FALSE ORDER BY updated_at DESC LIMIT 1`);
      if (draft.rows[0]) {
        const published = await query(`SELECT id FROM ${table} WHERE is_published = TRUE ORDER BY updated_at DESC LIMIT 1`);
        const row = draft.rows[0];
        const draftId = row.id;
        delete row.id;
        delete row.created_at;
        delete row.updated_at;
        row.is_published = true;
        const keys = Object.keys(row);
        const values = Object.values(row);
        if (published.rows[0]) {
          const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
          await query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [published.rows[0].id, ...values]);
        } else {
          await query(`UPDATE ${table} SET is_published = TRUE, updated_at = NOW() WHERE id = $1`, [draftId]);
        }
      }
    }

    const collections = ['services', 'projects', 'skills', 'process_steps', 'testimonials', 'navigation_items', 'page_sections'];
    for (const table of collections) {
      await query(`UPDATE ${table} SET is_published = TRUE, updated_at = NOW() WHERE is_published = FALSE`);
    }

    const adminId = String(req.user?.id || 'admin');
    const adminEmail = req.user?.email || 'admin@example.com';
    await query(
      `INSERT INTO publishing_history (admin_id, admin_email, action, section, details) VALUES ($1, $2, 'publish', 'all', $3)`,
      [adminId, adminEmail, JSON.stringify({ summary: 'Published all draft changes to live website' })]
    ).catch((err) => console.error('Error logging history:', err.message));

    ok(res, { published: true, message: 'All drafts published successfully.' });
  } catch (error) {
    console.error('Error publishing all drafts:', error);
    fail(res, 500, error.message || 'Failed to publish all drafts.');
  }
});

// Media
app.get('/api/media', requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      'SELECT id, file_name, file_url, storage_path, file_type, file_size, alt_text, uploaded_at FROM media_items ORDER BY uploaded_at DESC'
    );
    ok(res, result.rows);
  } catch (error) {
    console.error('Error fetching media:', error);
    fail(res, 500, error.message || 'Failed to load media.');
  }
});

app.post('/api/media/upload', requireAdmin, async (req, res) => {
  try {
    const { fileName, contentType, dataUrl, altText, folder } = req.body || {};
    if (!fileName || !contentType || !dataUrl) {
      fail(res, 400, 'File name, content type, and file data are required.');
      return;
    }
    if (!String(contentType).startsWith('image/')) {
      fail(res, 400, 'Only image files are allowed.');
      return;
    }
    const base64 = String(dataUrl).split(',')[1];
    if (!base64) {
      fail(res, 400, 'Invalid file data.');
      return;
    }
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      fail(res, 400, 'File must be smaller than 10 MB.');
      return;
    }
    fs.mkdirSync(uploadsDir, { recursive: true });
    const safeFolder = String(folder || 'general').replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const targetDir = path.join(uploadsDir, safeFolder);
    fs.mkdirSync(targetDir, { recursive: true });
    const safeName = `${Date.now()}-${String(fileName).replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const filePath = path.join(targetDir, safeName);
    fs.writeFileSync(filePath, buffer);
    const storagePath = `${safeFolder}/${safeName}`;
    const fileUrl = `/uploads/${storagePath}`;

    // Ensure data_url column exists in media_items before insert
    try {
      await query('ALTER TABLE media_items ADD COLUMN IF NOT EXISTS data_url TEXT');
    } catch (altErr) {
      console.warn('[media-upload] Column alter check note:', altErr.message);
    }

    let result;
    try {
      result = await query(
        'INSERT INTO media_items (file_name, file_url, storage_path, file_type, file_size, alt_text, data_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, file_name, file_url, storage_path, file_type, file_size, alt_text, uploaded_at',
        [fileName, fileUrl, storagePath, contentType, buffer.length, altText || null, dataUrl],
      );
    } catch (insertErr) {
      console.error('[media-upload] Primary insert with data_url failed:', insertErr.message);
      result = await query(
        'INSERT INTO media_items (file_name, file_url, storage_path, file_type, file_size, alt_text) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, file_name, file_url, storage_path, file_type, file_size, alt_text, uploaded_at',
        [fileName, fileUrl, storagePath, contentType, buffer.length, altText || null],
      );
    }
    console.log(`[media-upload] Successfully stored: ${storagePath} (${buffer.length} bytes)`);
    ok(res, result.rows[0]);
  } catch (error) {
    console.error('Error uploading media:', error);
    fail(res, 500, error.message || 'Failed to upload media.');
  }
});

app.patch('/api/media/:id', requireAdmin, async (req, res) => {
  try {
    await query('UPDATE media_items SET alt_text = $1 WHERE id = $2', [req.body.alt_text ?? null, req.params.id]);
    ok(res, { updated: true });
  } catch (error) {
    console.error('Error updating media alt:', error);
    fail(res, 500, error.message || 'Failed to update media.');
  }
});

// Check if an image is referenced in any content before deleting
app.get('/api/media/:id/references', requireAdmin, async (req, res) => {
  try {
    const item = await query('SELECT file_url FROM media_items WHERE id = $1', [req.params.id]);
    if (!item.rows[0]) {
      fail(res, 404, 'Media item not found.');
      return;
    }
    const url = item.rows[0].file_url;
    const references = [];

    const [hero, about, site, services, projects, testimonials] = await Promise.all([
      query(
        'SELECT full_name FROM hero_content WHERE profile_image_url = $1 OR background_image_url = $1',
        [url],
      ),
      query('SELECT title FROM about_content WHERE profile_image_url = $1', [url]),
      query(
        'SELECT site_name FROM site_settings WHERE logo_url = $1 OR profile_image_url = $1 OR favicon_url = $1',
        [url],
      ),
      query('SELECT title FROM services WHERE image_url = $1', [url]),
      query('SELECT title FROM projects WHERE cover_image_url = $1', [url]),
      query('SELECT client_name FROM testimonials WHERE client_image_url = $1', [url]),
    ]);

    if (hero.rows.length) references.push(...hero.rows.map((r) => `Hero Section (${r.full_name})`));
    if (about.rows.length) references.push(...about.rows.map((r) => `About Section (${r.title})`));
    if (site.rows.length) references.push(...site.rows.map((r) => `Site Settings (${r.site_name})`));
    if (services.rows.length) references.push(...services.rows.map((r) => `Service: ${r.title}`));
    if (projects.rows.length) references.push(...projects.rows.map((r) => `Project: ${r.title}`));
    if (testimonials.rows.length) references.push(...testimonials.rows.map((r) => `Testimonial: ${r.client_name}`));

    ok(res, { inUse: references.length > 0, references });
  } catch (error) {
    console.error('Error checking media references:', error);
    fail(res, 500, error.message || 'Failed to check media references.');
  }
});

app.delete('/api/media/:id', requireAdmin, async (req, res) => {
  try {
    const item = await query('SELECT storage_path FROM media_items WHERE id = $1', [req.params.id]);
    if (item.rows[0]?.storage_path) {
      const filePath = path.join(uploadsDir, item.rows[0].storage_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await query('DELETE FROM media_items WHERE id = $1', [req.params.id]);
    ok(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    fail(res, 500, error.message || 'Failed to delete media.');
  }
});

// Contact messages
app.post('/api/contact-messages', async (req, res) => {
  try {
    const sender_name = req.body?.sender_name || req.body?.name;
    const sender_email = req.body?.sender_email || req.body?.email;
    const subject = req.body?.subject || null;
    const message = req.body?.message;

    if (!sender_name || !sender_email || !message) {
      fail(res, 400, 'Name, email, and message are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender_email)) {
      fail(res, 400, 'A valid email address is required.');
      return;
    }
    if (getPool()) {
      const result = await query(
        'INSERT INTO contact_messages (sender_name, sender_email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [sender_name, sender_email, subject, message],
      );
      ok(res, result.rows[0]);
    } else {
      const contactMessage = {
        id: crypto.randomUUID(),
        sender_name,
        sender_email,
        subject,
        message,
        status: 'new',
        created_at: new Date().toISOString(),
      };
      writeLocalContactMessages([contactMessage, ...readLocalContactMessages()]);
      ok(res, contactMessage);
    }
  } catch (error) {
    console.error('Error submitting contact message:', error);
    fail(res, 500, error.message || 'Failed to submit message.');
  }
});

app.get('/api/contact-messages', requireAdmin, async (_req, res) => {
  try {
    if (getPool()) {
      const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      ok(res, result.rows);
    } else {
      ok(readLocalContactMessages());
    }
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    fail(res, 500, error.message || 'Failed to load messages.');
  }
});

app.patch('/api/contact-messages/:id', requireAdmin, async (req, res) => {
  try {
    const status = req.body.status;
    if (!['new', 'read', 'replied'].includes(status)) {
      fail(res, 400, 'Invalid status.');
      return;
    }
    if (getPool()) {
      await query('UPDATE contact_messages SET status = $1 WHERE id = $2', [status, req.params.id]);
    } else {
      const messages = readLocalContactMessages();
      writeLocalContactMessages(
        messages.map((message) => (message.id === req.params.id ? { ...message, status } : message)),
      );
    }
    ok(res, { updated: true });
  } catch (error) {
    console.error('Error updating contact message:', error);
    fail(res, 500, error.message || 'Failed to update message.');
  }
});

app.delete('/api/contact-messages/:id', requireAdmin, async (req, res) => {
  try {
    if (getPool()) {
      await query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    } else {
      const messages = readLocalContactMessages();
      writeLocalContactMessages(messages.filter((message) => message.id !== req.params.id));
    }
    ok(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    fail(res, 500, error.message || 'Failed to delete message.');
  }
});

// Unknown API routes handler - always return JSON 404
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve frontend static build and React Router SPA fallback in production
const distDir = path.join(process.cwd(), 'dist');
const isViteDev = process.env.VITE === 'true' || process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'dev:web';

if (!isViteDev && fs.existsSync(distDir)) {
  // Serve static assets from dist
  app.use(express.static(distDir, {
    maxAge: '1d',
    index: false,
  }));

  // Client-side SPA routing fallback for all non-API and non-Uploads GET / HEAD requests
  app.use((req, res, next) => {
    if (
      (req.method === 'GET' || req.method === 'HEAD') &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/uploads')
    ) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

export default app;
