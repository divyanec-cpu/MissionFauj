import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { renderAdminPage } from '../../lib/adminLayout.js';

export const statsRouter = Router();

function groupByDay(dates: Date[]): Array<[string, number]> {
  const map = new Map<string, number>();
  for (const d of dates) {
    const day = d.toISOString().slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function renderDayTable(title: string, rows: Array<[string, number]>): string {
  const body =
    rows.length === 0
      ? '<tr><td colspan="2" class="muted">No data yet</td></tr>'
      : rows.map(([day, count]) => `<tr><td>${day}</td><td>${count}</td></tr>`).join('');
  return `<h2>${title}</h2><table><thead><tr><th>Day</th><th>Count</th></tr></thead><tbody>${body}</tbody></table>`;
}

// GET /admin/stats — aggregate-only, no phone numbers or question/answer
// text rendered here by design (see the model comments in schema.prisma).
statsRouter.get('/', async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let allConsents, recentConsents, totalAiEvents, recentAiEvents, aiBySurface, subEventsAll, subEventsRecent, subByKind;
  try {
    [allConsents, recentConsents, totalAiEvents, recentAiEvents, aiBySurface, subEventsAll, subEventsRecent, subByKind] = await Promise.all([
      prisma.consentRecord.findMany({ select: { candidatePhone: true, role: true } }),
      prisma.consentRecord.findMany({ where: { acceptedAt: { gte: since } }, select: { acceptedAt: true } }),
      prisma.aiUsageEvent.count(),
      prisma.aiUsageEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.aiUsageEvent.groupBy({ by: ['surface'], _count: { _all: true } }),
      prisma.subscriptionEvent.count(),
      prisma.subscriptionEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.subscriptionEvent.groupBy({ by: ['kind', 'exam'], _count: { _all: true } }),
    ]);
  } catch (err) {
    console.error('Failed to load admin stats', err);
    res
      .status(500)
      .send(
        renderAdminPage({
          title: 'Stats',
          activePath: '/admin/stats',
          body: `<div class="error">Could not load stats — check server logs (likely a migration hasn't been deployed yet).</div>`,
        }),
      );
    return;
  }

  const uniqueUsers = new Set(allConsents.map((c) => c.candidatePhone)).size;
  const selfConsents = allConsents.filter((c) => c.role === 'self').length;
  const guardianConsents = allConsents.filter((c) => c.role === 'guardian').length;

  const surfaceRows = aiBySurface.map((r) => `<tr><td>${r.surface}</td><td>${r._count._all}</td></tr>`).join('');
  const subKindRows = subByKind
    .map((r) => `<tr><td>${r.kind}</td><td>${r.exam ?? '—'}</td><td>${r._count._all}</td></tr>`)
    .join('');

  const html = `
    <h1>MissionFauj — Real Usage</h1>
    <p class="muted">Aggregate counts only — no phone numbers or chat/subscription content shown here.</p>
    <div class="stats">
      <div class="stat"><div class="value">${uniqueUsers}</div><div class="label">Unique signups</div></div>
      <div class="stat"><div class="value">${selfConsents}</div><div class="label">Self-consented (18+)</div></div>
      <div class="stat"><div class="value">${guardianConsents}</div><div class="label">Guardian-consented (&lt;18)</div></div>
      <div class="stat"><div class="value">${totalAiEvents}</div><div class="label">AI Assist replies (all time)</div></div>
      <div class="stat"><div class="value">${subEventsAll}</div><div class="label">Subscription/trial events (all time)</div></div>
    </div>

    <h2>AI Assist by surface (all time)</h2>
    <table><thead><tr><th>Surface</th><th>Count</th></tr></thead><tbody>${surfaceRows || '<tr><td colspan="2" class="muted">No data yet</td></tr>'}</tbody></table>

    <h2>Subscription/trial events by kind (all time)</h2>
    <table><thead><tr><th>Kind</th><th>Exam</th><th>Count</th></tr></thead><tbody>${subKindRows || '<tr><td colspan="3" class="muted">No data yet</td></tr>'}</tbody></table>

    ${renderDayTable('Signups per day (last 30 days)', groupByDay(recentConsents.map((c) => c.acceptedAt)))}
    ${renderDayTable('AI Assist replies per day (last 30 days)', groupByDay(recentAiEvents.map((e) => e.createdAt)))}
    ${renderDayTable('Subscription/trial events per day (last 30 days)', groupByDay(subEventsRecent.map((e) => e.createdAt)))}
  `;

  res.send(renderAdminPage({ title: 'Stats', activePath: '/admin/stats', body: html }));
});
