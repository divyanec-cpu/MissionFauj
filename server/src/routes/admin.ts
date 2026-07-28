import { Router } from 'express';
import { timingSafeEqual } from 'crypto';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Buffers of different length would make timingSafeEqual throw — the
  // length check itself is fine to short-circuit on, since only the byte
  // comparison of matching-length buffers is timing-sensitive here.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Bare shared-secret gate (HTTP Basic, username ignored) — this is an
// internal stats page for the app owner, not a multi-admin system, so a
// single ADMIN_TOKEN checked at constant time is proportionate. Render
// mints the token itself (generateValue: true); retrieve it from the
// Render dashboard's Environment tab to view this page.
adminRouter.use((req, res, next) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    res.status(503).send('Admin dashboard is not configured (ADMIN_TOKEN unset).');
    return;
  }
  const header = req.headers.authorization ?? '';
  const [scheme, encoded] = header.split(' ');
  const provided = scheme === 'Basic' && encoded ? Buffer.from(encoded, 'base64').toString('utf8').split(':')[1] : undefined;
  if (!provided || !safeEqual(provided, token)) {
    res.set('WWW-Authenticate', 'Basic realm="MissionFauj Admin"');
    res.status(401).send('Authentication required.');
    return;
  }
  next();
});

function groupByDay(dates: Date[]): Array<[string, number]> {
  const map = new Map<string, number>();
  for (const d of dates) {
    const day = d.toISOString().slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function renderTable(title: string, rows: Array<[string, number]>): string {
  const body =
    rows.length === 0
      ? '<tr><td colspan="2" class="muted">No data yet</td></tr>'
      : rows.map(([day, count]) => `<tr><td>${day}</td><td>${count}</td></tr>`).join('');
  return `<h2>${title}</h2><table><thead><tr><th>Day</th><th>Count</th></tr></thead><tbody>${body}</tbody></table>`;
}

const PAGE_STYLE = `
  body { font-family: -apple-system, Segoe UI, sans-serif; background: #12130e; color: #ece7d4; margin: 0; padding: 2rem; }
  h1 { color: #d99a3d; }
  h2 { color: #c9bd97; margin-top: 2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .stats { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 1.5rem 0; }
  .stat { background: #1b1d15; border: 1px solid #3a3d2e; padding: 1rem 1.5rem; min-width: 160px; }
  .stat .value { font-size: 1.8rem; font-weight: 700; color: #d99a3d; }
  .stat .label { font-size: 0.75rem; color: #9b9a86; text-transform: uppercase; letter-spacing: 0.05em; }
  table { border-collapse: collapse; width: 100%; max-width: 480px; }
  th, td { text-align: left; padding: 0.4rem 0.8rem; border-bottom: 1px solid #3a3d2e; }
  th { color: #9b9a86; font-size: 0.75rem; text-transform: uppercase; }
  .muted { color: #9b9a86; }
`;

// GET /admin/stats — aggregate-only, no phone numbers or question text
// rendered here by design (see AiUsageEvent's comment in schema.prisma).
adminRouter.get('/stats', async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let allConsents, recentConsents, totalAiEvents, recentAiEvents, aiBySurface;
  try {
    [allConsents, recentConsents, totalAiEvents, recentAiEvents, aiBySurface] = await Promise.all([
      prisma.consentRecord.findMany({ select: { candidatePhone: true, role: true } }),
      prisma.consentRecord.findMany({ where: { acceptedAt: { gte: since } }, select: { acceptedAt: true } }),
      prisma.aiUsageEvent.count(),
      prisma.aiUsageEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.aiUsageEvent.groupBy({ by: ['surface'], _count: { _all: true } }),
    ]);
  } catch (err) {
    // Most likely cause: the AiUsageEvent migration hasn't been deployed
    // yet (see render.yaml's comment — migrations are a deliberate manual
    // step, not automatic on deploy). Fail this one request, not the server.
    console.error('Failed to load admin stats', err);
    res.status(500).send('Could not load stats — check server logs (likely the AiUsageEvent migration hasn\'t been deployed yet).');
    return;
  }

  const uniqueUsers = new Set(allConsents.map((c) => c.candidatePhone)).size;
  const selfConsents = allConsents.filter((c) => c.role === 'self').length;
  const guardianConsents = allConsents.filter((c) => c.role === 'guardian').length;

  const surfaceRows = aiBySurface.map((r) => `<tr><td>${r.surface}</td><td>${r._count._all}</td></tr>`).join('');

  res.set('Content-Type', 'text/html; charset=utf-8').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>MissionFauj — Admin Stats</title><style>${PAGE_STYLE}</style></head>
<body>
  <h1>MissionFauj — Real Usage</h1>
  <p class="muted">Aggregate counts only — no phone numbers or chat content shown here.</p>
  <div class="stats">
    <div class="stat"><div class="value">${uniqueUsers}</div><div class="label">Unique signups</div></div>
    <div class="stat"><div class="value">${selfConsents}</div><div class="label">Self-consented (18+)</div></div>
    <div class="stat"><div class="value">${guardianConsents}</div><div class="label">Guardian-consented (&lt;18)</div></div>
    <div class="stat"><div class="value">${totalAiEvents}</div><div class="label">AI Assist replies (all time)</div></div>
  </div>

  <h2>AI Assist by surface (all time)</h2>
  <table><thead><tr><th>Surface</th><th>Count</th></tr></thead><tbody>${surfaceRows || '<tr><td colspan="2" class="muted">No data yet</td></tr>'}</tbody></table>

  ${renderTable('Signups per day (last 30 days)', groupByDay(recentConsents.map((c) => c.acceptedAt)))}
  ${renderTable('AI Assist replies per day (last 30 days)', groupByDay(recentAiEvents.map((e) => e.createdAt)))}
</body></html>`);
});
