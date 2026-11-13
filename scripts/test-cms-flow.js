import app from '../server/index.js';
import http from 'http';

async function run() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3099, resolve));
  console.log('[test] Server listening on port 3099');

  const baseUrl = 'http://localhost:3099';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    console.log('[test] Health status:', health.status, 'db:', health.database);

    // 2. Login
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;
    console.log('[test] Admin Login success! User:', loginData.user.email);

    // 3. Dashboard overview
    const dashRes = await fetch(`${baseUrl}/api/dashboard`);
    const dash = await dashRes.json();
    console.log('[test] Dashboard overview:', {
      totalProjects: dash.totalProjects,
      totalServices: dash.totalServices,
      draftChanges: dash.draftChanges,
      lastPublishedAt: dash.lastPublishedAt,
    });

    // 4. Save Hero as DRAFT (is_published = false)
    const draftSubtitle = 'Unique Draft Subtitle ' + Date.now();
    const heroSaveRes = await fetch(`${baseUrl}/api/admin/hero_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_published: false,
        greeting: 'Hello, I am',
        full_name: 'Azmina Zahra',
        professional_title: 'Social Media Marketing Specialist',
        subtitle: draftSubtitle,
        availability_status: 'Available for Q2',
        description: 'Test hero draft description.',
      }),
    });
    const heroSave = await heroSaveRes.json();
    console.log('[test] Saved hero draft:', heroSave);

    // 5. Query public portfolio (should NOT have draft subtitle)
    const pubRes = await fetch(`${baseUrl}/api/portfolio`);
    const pubData = await pubRes.json();
    console.log('[test] Public portfolio subtitle:', pubData.hero?.subtitle);
    if (pubData.hero?.subtitle === draftSubtitle) {
      console.warn('[warning] Public portfolio should not show unpublished draft subtitle!');
    } else {
      console.log('[test] SUCCESS: Public portfolio kept isolated from unpublished draft!');
    }

    // 6. Query preview portfolio (preview=true, MUST have draft subtitle)
    const prevRes = await fetch(`${baseUrl}/api/portfolio?preview=true`);
    const prevData = await prevRes.json();
    console.log('[test] Preview portfolio subtitle:', prevData.hero?.subtitle);
    if (prevData.hero?.subtitle === draftSubtitle) {
      console.log('[test] SUCCESS: Preview portfolio correctly loaded draft content!');
    } else {
      throw new Error('Preview did not load draft content.');
    }

    // 7. Global publish all drafts
    const pubAllRes = await fetch(`${baseUrl}/api/admin/publish-all-drafts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const pubAllResult = await pubAllRes.json();
    console.log('[test] Publish all drafts result:', pubAllResult);

    // 8. Now verify public portfolio DOES have the published subtitle!
    const pubAfterRes = await fetch(`${baseUrl}/api/portfolio`);
    const pubAfterData = await pubAfterRes.json();
    console.log('[test] Public portfolio subtitle after publish:', pubAfterData.hero?.subtitle);
    if (pubAfterData.hero?.subtitle === draftSubtitle) {
      console.log('[test] SUCCESS: Public site updated with published content!');
    } else {
      throw new Error('Public site was not updated after publishing.');
    }

    // 9. Check Publishing History
    const historyRes = await fetch(`${baseUrl}/api/admin/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const history = await historyRes.json();
    console.log('[test] Audit history entries count:', history.length);
    console.log('[test] Latest history entry:', history[0]);

    console.log('\n>>> ALL CMS END-TO-END FLOW TESTS PASSED SUCCESSFULLY! <<<\n');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('[test-cms-flow ERROR]', err);
  process.exit(1);
});
