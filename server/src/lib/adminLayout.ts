export const PAGE_STYLE = `
  body { font-family: -apple-system, Segoe UI, sans-serif; background: #12130e; color: #ece7d4; margin: 0; padding: 0; }
  a { color: #d99a3d; }
  h1 { color: #d99a3d; margin: 0 0 0.25rem; }
  h2 { color: #c9bd97; margin-top: 2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
  main { padding: 2rem; max-width: 960px; }
  nav { background: #1b1d15; border-bottom: 1px solid #3a3d2e; padding: 0.9rem 2rem; display: flex; gap: 1.25rem; flex-wrap: wrap; align-items: center; }
  nav a { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.03em; text-decoration: none; color: #9b9a86; }
  nav a:hover, nav a.active { color: #d99a3d; }
  nav .spacer { flex: 1; }
  .stats { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 1.5rem 0; }
  .stat { background: #1b1d15; border: 1px solid #3a3d2e; padding: 1rem 1.5rem; min-width: 160px; }
  .stat .value { font-size: 1.8rem; font-weight: 700; color: #d99a3d; }
  .stat .label { font-size: 0.75rem; color: #9b9a86; text-transform: uppercase; letter-spacing: 0.05em; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { text-align: left; padding: 0.5rem 0.8rem; border-bottom: 1px solid #3a3d2e; font-size: 0.9rem; }
  th { color: #9b9a86; font-size: 0.7rem; text-transform: uppercase; }
  .muted { color: #9b9a86; }
  .error { color: #d9765a; background: #2a1a15; border: 1px solid #5a3a2e; padding: 0.75rem 1rem; margin-bottom: 1rem; }
  .card { background: #1b1d15; border: 1px solid #3a3d2e; padding: 1.5rem; max-width: 560px; }
  label { display: block; margin: 1rem 0 0.3rem; font-size: 0.8rem; color: #9b9a86; text-transform: uppercase; letter-spacing: 0.03em; }
  input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select {
    width: 100%; box-sizing: border-box; background: #22251a; border: 1px solid #3a3d2e; color: #ece7d4; padding: 0.6rem 0.75rem; font-size: 0.95rem; font-family: inherit;
  }
  textarea { min-height: 80px; }
  input[type="checkbox"] { margin-right: 0.5rem; }
  .checkbox-row { display: flex; align-items: center; margin-top: 1rem; }
  .checkbox-row label { margin: 0; text-transform: none; font-size: 0.9rem; color: #ece7d4; }
  button, .btn { font-family: inherit; cursor: pointer; border: none; background: #d99a3d; color: #1b1500; padding: 0.6rem 1.4rem; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 1.25rem; display: inline-block; text-decoration: none; }
  button.secondary, .btn.secondary { background: transparent; border: 1px solid #3a3d2e; color: #9b9a86; }
  button.danger, .btn.danger { background: #9c5b3c; color: #ece7d4; }
  .row-actions a { margin-right: 0.75rem; font-size: 0.8rem; }
  .toolbar { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
`;

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/stats', label: 'Stats' },
  { href: '/admin/experts', label: 'Experts' },
  { href: '/admin/digest-posts', label: 'Digest Posts' },
  { href: '/admin/pricing-plans', label: 'Pricing' },
  { href: '/admin/eligibility-rules', label: 'Eligibility Rules' },
  { href: '/admin/admin-users', label: 'Admin Accounts' },
  { href: '/admin/diagnostics', label: 'Diagnostics' },
];

export function renderAdminPage(opts: { title: string; activePath?: string; body: string; loggedIn?: boolean }): string {
  const { title, activePath, body, loggedIn = true } = opts;
  const nav = loggedIn
    ? `<nav>
        ${NAV_ITEMS.map((item) => `<a href="${item.href}" class="${item.href === activePath ? 'active' : ''}">${item.label}</a>`).join('')}
        <span class="spacer"></span>
        <a href="/admin/logout">Log out</a>
      </nav>`
    : '';
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title} — MissionFauj Admin</title><style>${PAGE_STYLE}</style></head>
<body>
${nav}
<main>${body}</main>
</body></html>`;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
