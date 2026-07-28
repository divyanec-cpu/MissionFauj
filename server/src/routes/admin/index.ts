import { Router } from 'express';
import express from 'express';
import { prisma } from '../../lib/prisma.js';
import { verifyPassword, requireAdminSession, setAdminCookie, clearAdminCookie, type AdminRequest } from '../../lib/adminAuth.js';
import { signAdminSession } from '../../lib/jwt.js';
import { renderAdminPage, escapeHtml } from '../../lib/adminLayout.js';
import { statsRouter } from './stats.js';
import { expertsRouter } from './experts.js';
import { digestPostsRouter } from './digestPosts.js';
import { pricingPlansRouter } from './pricingPlans.js';
import { eligibilityRulesRouter } from './eligibilityRules.js';
import { adminUsersRouter } from './adminUsers.js';
import { diagnosticsRouter } from './diagnostics.js';

export const adminRouter = Router();

// Every admin route reads plain HTML <form method="post"> submissions, not JSON.
adminRouter.use(express.urlencoded({ extended: false }));

function renderLoginForm(error?: string): string {
  return renderAdminPage({
    title: 'Log In',
    loggedIn: false,
    body: `
      <div style="max-width:420px;margin:4rem auto 0;">
        <h1>MissionFauj Admin</h1>
        ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}
        <form method="post" action="/admin/login" class="card">
          <label>Email</label><input type="text" name="email" required autofocus>
          <label>Password</label><input type="password" name="password" required>
          <button type="submit">Log In</button>
        </form>
      </div>
    `,
  });
}

adminRouter.get('/login', (_req, res) => {
  res.send(renderLoginForm());
});

adminRouter.post('/login', async (req, res) => {
  const email = (req.body.email ?? '').trim().toLowerCase();
  const password = req.body.password ?? '';
  const admin = email ? await prisma.adminUser.findUnique({ where: { email } }) : null;
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    res.status(401).send(renderLoginForm('Incorrect email or password.'));
    return;
  }
  const token = signAdminSession({ adminId: admin.id, email: admin.email });
  setAdminCookie(req, res, token);
  res.redirect('/admin');
});

adminRouter.get('/logout', (req, res) => {
  clearAdminCookie(req, res);
  res.redirect('/admin/login');
});

adminRouter.use(requireAdminSession);

adminRouter.get('/', (req: AdminRequest, res) => {
  const html = `
    <h1>MissionFauj Admin</h1>
    <p class="muted">Signed in as ${escapeHtml(req.admin?.email ?? '')}</p>
    <div class="stats">
      <a class="stat" href="/admin/stats" style="text-decoration:none;color:inherit"><div class="label">Real Usage</div></a>
      <a class="stat" href="/admin/experts" style="text-decoration:none;color:inherit"><div class="label">Experts</div></a>
      <a class="stat" href="/admin/digest-posts" style="text-decoration:none;color:inherit"><div class="label">Digest Posts</div></a>
      <a class="stat" href="/admin/pricing-plans" style="text-decoration:none;color:inherit"><div class="label">Pricing Plans</div></a>
      <a class="stat" href="/admin/eligibility-rules" style="text-decoration:none;color:inherit"><div class="label">Eligibility Rules</div></a>
      <a class="stat" href="/admin/admin-users" style="text-decoration:none;color:inherit"><div class="label">Admin Accounts</div></a>
      <a class="stat" href="/admin/diagnostics" style="text-decoration:none;color:inherit"><div class="label">Diagnostics</div></a>
    </div>
  `;
  res.send(renderAdminPage({ title: 'Dashboard', activePath: '/admin', body: html }));
});

adminRouter.use('/stats', statsRouter);
adminRouter.use('/experts', expertsRouter);
adminRouter.use('/digest-posts', digestPostsRouter);
adminRouter.use('/pricing-plans', pricingPlansRouter);
adminRouter.use('/eligibility-rules', eligibilityRulesRouter);
adminRouter.use('/admin-users', adminUsersRouter);
adminRouter.use('/diagnostics', diagnosticsRouter);
