INSERT INTO site_settings (is_published, site_name, owner_name, professional_title, email, phone, location, profile_image_url, instagram_url, tiktok_url, linkedin_url, whatsapp_url, seo_title, seo_description, copyright_text)
VALUES (TRUE, 'Azmina Zahra', 'Azmina Zahra', 'Social Media Marketing Specialist', 'hello@azminazahra.com', '+971 52 123 4567', 'Dubai, UAE', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80', 'https://instagram.com', 'https://tiktok.com', 'https://linkedin.com', 'https://wa.me/971521234567', 'Azmina Zahra | Social Media Marketing Specialist', 'Premium social media marketing strategy and creative services for brands ready to grow.', '© 2025 Azmina Zahra. All rights reserved.')
ON CONFLICT DO NOTHING;

INSERT INTO hero_content (is_published, greeting, full_name, professional_title, description, profile_image_url, primary_button_text, primary_button_url, secondary_button_text, secondary_button_url)
VALUES (TRUE, 'Hello, I''m', 'Azmina Zahra', 'Social Media Marketing Specialist', 'I help brands turn attention into action with strategic content, story-led campaigns, and performance-driven growth systems.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80', 'View My Work', '#work', 'Let''s Work Together', '#contact')
ON CONFLICT DO NOTHING;

INSERT INTO about_content (is_published, title, subtitle, description, profile_image_url, additional_description)
VALUES (TRUE, 'A brand storyteller with strategy in her DNA.', 'About Me', 'I design thoughtful marketing experiences that connect with people, elevate brands, and turn engagement into measurable results.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80', 'I partner with founders and growing brands to build modern, people-first digital marketing systems that feel premium and perform in real life.')
ON CONFLICT DO NOTHING;

INSERT INTO cta_content (is_published, script_greeting, main_heading, supporting_description, highlighted_words, button_text, button_url)
VALUES (TRUE, 'Thank you for your support!', 'Ready to grow your brand?', 'Let''s focus on building and growing your presence with strategy, creativity, and performance that feels premium from day one.', 'building,growing', 'Contact Me', 'https://wa.me/971521234567')
ON CONFLICT DO NOTHING;

INSERT INTO footer_content (is_published, copyright_text, email, phone, instagram_url, tiktok_url, linkedin_url, whatsapp_url, footer_description)
VALUES (TRUE, '© 2025 Azmina Zahra. All rights reserved.', 'hello@azminazahra.com', '+971 52 123 4567', 'https://instagram.com', 'https://tiktok.com', 'https://linkedin.com', 'https://wa.me/971521234567', 'Premium social media marketing strategy and creative services.')
ON CONFLICT DO NOTHING;

INSERT INTO statistics (is_published, is_visible, label, value, suffix, icon, display_order) VALUES
(TRUE, TRUE, 'Impressions', '12K', '+', 'TrendingUp', 1),
(TRUE, TRUE, 'Likes', '502', '+', 'Heart', 2),
(TRUE, TRUE, 'Comments', '73', '+', 'MessageSquare', 3),
(TRUE, TRUE, 'Happy Clients', '20', '+', 'Users', 4)
ON CONFLICT DO NOTHING;

INSERT INTO services (is_published, is_visible, title, description, icon, display_order) VALUES
(TRUE, TRUE, 'Social Media Management', 'Content calendars, daily engagement, and community growth strategies built around your brand voice.', 'Megaphone', 1),
(TRUE, TRUE, 'Content Strategy', 'Audience-focused plans that align your content with marketing goals, campaigns, and conversion funnels.', 'Target', 2),
(TRUE, TRUE, 'Content Creation', 'Scroll-stopping visuals, short-form videos, and branded storytelling designed for consistent engagement.', 'PenTool', 3)
ON CONFLICT DO NOTHING;

INSERT INTO projects (is_published, is_featured, title, slug, description, category, cover_image_url, result_metric, result_description, case_study_url, display_order) VALUES
(TRUE, TRUE, 'Brand Lift Campaign', 'brand-lift-campaign', 'A lifestyle beauty launch strategy that grew organic reach and strengthened community trust.', 'social', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', '+186% engagement', 'Organic growth', '#contact', 1),
(TRUE, TRUE, 'E-commerce Growth', 'ecommerce-growth', 'Creative ads and retention messaging for a boutique retail brand with a sharper conversion funnel.', 'performance', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', '3.4x ROAS', 'Ad performance', '#contact', 2)
ON CONFLICT DO NOTHING;

INSERT INTO skills (is_published, is_visible, name, icon, display_order) VALUES
(TRUE, TRUE, 'Copywriting', '', 1),
(TRUE, TRUE, 'Canva', '', 2),
(TRUE, TRUE, 'CapCut', '', 3)
ON CONFLICT DO NOTHING;

INSERT INTO process_steps (is_published, is_visible, step_number, title, description, display_order) VALUES
(TRUE, TRUE, '01', 'Understand', 'I learn your goals, audience, and brand positioning.', 1),
(TRUE, TRUE, '02', 'Plan', 'We map a content strategy aligned with your growth objectives.', 2),
(TRUE, TRUE, '03', 'Create', 'I develop content systems, campaigns, and creative direction.', 3),
(TRUE, TRUE, '04', 'Improve', 'We refine performance with insights and optimisation loops.', 4)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (is_published, client_name, client_designation, client_image_url, testimonial, display_order) VALUES
(TRUE, 'Nadia Rahman', 'Founder, Noor Atelier', '', 'Azmina brought clarity, creativity, and consistent execution to our brand.', 1)
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (is_published, section_key, title, is_visible, display_order) VALUES
(TRUE, 'hero', 'Hero', TRUE, 1),
(TRUE, 'stats', 'Statistics', TRUE, 2),
(TRUE, 'about', 'About', TRUE, 3),
(TRUE, 'services', 'Services', TRUE, 4),
(TRUE, 'work', 'Featured Work', TRUE, 5),
(TRUE, 'skills', 'Skills', TRUE, 6),
(TRUE, 'process', 'Process', TRUE, 7),
(TRUE, 'testimonials', 'Testimonials', TRUE, 8),
(TRUE, 'contact', 'Contact', TRUE, 9)
ON CONFLICT DO NOTHING;
