import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { hashPassword } from '../../lib/adminAuth.js';
import { renderAdminPage, escapeHtml } from '../../lib/adminLayout.js';

// Bespoke rather than routed through adminResource.ts — password handling
// (never echoed back into a form) and the last-admin delete guard don't fit
// the generic list/create/edit shape the other four resources share.
export const adminUsersRouter = Router();
const BASE = '/admin/admin-users';

adminUsersRouter.get('/', async (_req, res) => {
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
  const rows = admins
    .map(
      (a) => `<tr>
        <td>${escapeHtml(a.email)}</td>
        <td>${a.createdAt.toISOString().slice(0, 10)}</td>
        <td class="row-actions">
          <a href="${BASE}/${a.id}/password">Change password</a>
          <form method="post" action="${BASE}/${a.id}/delete" style="display:inline" onsubmit="return confirm('Remove this admin account?')">
            <button type="submit" class="danger" style="margin:0;padding:0.2rem 0.6rem;font-size:0.75rem" ${admins.length <= 1 ? 'disabled' : ''}>Delete</button>
          </form>
        </td>
      </tr>`,
    )
    .join('');
  const html = `
    <div class="toolbar"><h1>Admin Accounts</h1><a class="btn" href="${BASE}/new">+ Add new</a></div>
    <table><thead><tr><th>Email</th><th>Created</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    ${admins.length <= 1 ? '<p class="muted">The last remaining admin account can\'t be deleted.</p>' : ''}
  `;
  res.send(renderAdminPage({ title: 'Admin Accounts', activePath: BASE, body: html }));
});

function renderNewForm(error?: string, email?: string): string {
  return `
    <h1>Add Admin Account</h1>
    ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}
    <form method="post" action="${BASE}/new" class="card">
      <label>Email</label><input type="text" name="email" required value="${escapeHtml(email ?? '')}">
      <label>Password</label><input type="password" name="password" required minlength="8">
      <div><button type="submit">Create</button> <a class="btn secondary" href="${BASE}">Cancel</a></div>
    </form>
  `;
}

adminUsersRouter.get('/new', (_req, res) => {
  res.send(renderAdminPage({ title: 'New Admin Account', activePath: BASE, body: renderNewForm() }));
});

adminUsersRouter.post('/new', async (req, res) => {
  const email = (req.body.email ?? '').trim().toLowerCase();
  const password = req.body.password ?? '';
  if (!email || password.length < 8) {
    res
      .status(400)
      .send(
        renderAdminPage({
          title: 'New Admin Account',
          activePath: BASE,
          body: renderNewForm('Email is required and password must be at least 8 characters.', email),
        }),
      );
    return;
  }
  try {
    await prisma.adminUser.create({ data: { email, passwordHash: hashPassword(password) } });
    res.redirect(BASE);
  } catch (err) {
    res
      .status(400)
      .send(
        renderAdminPage({
          title: 'New Admin Account',
          activePath: BASE,
          body: renderNewForm(err instanceof Error ? err.message : 'Could not create account (email may already be in use).', email),
        }),
      );
  }
});

adminUsersRouter.get('/:id/password', async (req, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.params.id } });
  if (!admin) {
    res.status(404).send(renderAdminPage({ title: 'Admin Accounts', activePath: BASE, body: '<p>Not found.</p>' }));
    return;
  }
  const html = `
    <h1>Change Password — ${escapeHtml(admin.email)}</h1>
    <form method="post" action="${BASE}/${admin.id}/password" class="card">
      <label>New password</label><input type="password" name="password" required minlength="8">
      <div><button type="submit">Save</button> <a class="btn secondary" href="${BASE}">Cancel</a></div>
    </form>
  `;
  res.send(renderAdminPage({ title: 'Change Password', activePath: BASE, body: html }));
});

adminUsersRouter.post('/:id/password', async (req, res) => {
  const password = req.body.password ?? '';
  if (password.length < 8) {
    res.status(400).send(
      renderAdminPage({
        title: 'Change Password',
        activePath: BASE,
        body: `<div class="error">Password must be at least 8 characters.</div><a class="btn secondary" href="${BASE}/${req.params.id}/password">Back</a>`,
      }),
    );
    return;
  }
  await prisma.adminUser.update({ where: { id: req.params.id }, data: { passwordHash: hashPassword(password) } });
  res.redirect(BASE);
});

adminUsersRouter.post('/:id/delete', async (req, res) => {
  const count = await prisma.adminUser.count();
  if (count <= 1) {
    res.redirect(BASE);
    return;
  }
  await prisma.adminUser.delete({ where: { id: req.params.id } }).catch(() => {});
  res.redirect(BASE);
});
