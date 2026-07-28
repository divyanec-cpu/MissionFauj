import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/adminAuth.js';
import { authRouter } from './routes/auth.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin/index.js';
import { contentRouter } from './routes/content.js';

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
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`MissionFauj API listening on :${port}`));
