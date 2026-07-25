import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  // TEMPORARY: surface the real error while diagnosing a 500 that doesn't
  // reproduce locally against the same production DB — revert to the
  // generic message once the root cause is confirmed.
  res.status(500).json({
    error: 'Internal server error',
    debug: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
  });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`MissionFauj API listening on :${port}`));
