import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/adminAuth.js';
import { authRouter } from './routes/auth.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin/index.js';
import { contentRouter } from './routes/content.js';
import { meRouter } from './routes/me.js';

const app = express();
// Render terminates TLS at a proxy in front of this app — without this,
// req.secure is always false, so the admin session cookie's Secure flag
// would never be set in production.
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/ai', aiRouter);
app.use('/admin', adminRouter);
app.use('/content', contentRouter);
app.use('/me', meRouter);

// One-time bootstrap: if no admin account exists yet and both env vars are
// set, create the first one. Idempotent (only fires while the table is
// empty) — safe to leave in permanently as a recovery path.
async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) return;
  const count = await prisma.adminUser.count();
  if (count > 0) return;
  await prisma.adminUser.create({ data: { email, passwordHash: hashPassword(password) } });
  console.log(`Bootstrapped initial admin account: ${email}`);
}
bootstrapAdmin().catch((err) => console.error('Admin bootstrap failed', err));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // body-parser rejects oversized and malformed bodies before any route runs,
  // so without this they'd surface as a 500 — telling the caller the server
  // broke when in fact their request was refused, and burying it in the error
  // log alongside genuine faults.
  const type = (err as { type?: string } | null)?.type;
  if (type === 'entity.too.large') {
    res.status(413).json({ error: 'That request was too large.' });
    return;
  }
  if (type === 'entity.parse.failed') {
    res.status(400).json({ error: 'That request body was not valid JSON.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Render injects PORT in production. The local fallback is 4010 rather than
// the conventional 4000 because another project on the same dev machine
// claims 4000 — and the failure mode is genuinely misleading rather than
// loud: the other app answers /health, so the server looks up while every
// MissionFauj route returns 404.
const port = Number(process.env.PORT) || 4010;
app.listen(port, () => console.log(`MissionFauj API listening on :${port}`));
