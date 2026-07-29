import type { NextFunction, Request, Response } from 'express';
import { verifyCandidateSession } from './jwt.js';

export interface CandidateRequest extends Request {
  candidatePhone?: string;
}

/**
 * Gates the per-candidate API on a session token issued at the end of the
 * sign-in flow, once consent is recorded.
 *
 * The phone comes from the verified token and never from the request body —
 * that is the whole point. Any route that took a phone as a parameter would be
 * back to letting a caller name whichever candidate's data they wanted.
 *
 * A 401 here is not treated as a logout by the client: it keeps working from
 * its local cache and stops syncing, so an expired session degrades quietly
 * rather than locking a candidate out of prep they already paid for.
 */
export function requireCandidateSession(req: CandidateRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Sign in to sync your progress.' });
    return;
  }
  try {
    req.candidatePhone = verifyCandidateSession(token).phone;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Sign in again to keep syncing.' });
  }
}
