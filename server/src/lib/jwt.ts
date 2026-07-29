import jwt from 'jsonwebtoken';

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set. Copy .env.example to .env and configure it.');
  return s;
}

// Short-lived on purpose: these tokens only carry a candidate through the
// sign-up flow itself (a few minutes across a handful of screens). The
// durable one issued at the end of that flow is CANDIDATE_SESSION_TTL below.
const TOKEN_TTL = '20m';

// The candidate's actual session, issued once consent is recorded and kept
// client-side so their profile and entitlements can be synced on return
// visits. Long by web standards because the alternative is making a student
// re-verify by SMS every few days on their own phone, which costs real money
// per message and trains people to expect OTP prompts. Expiry is not a
// logout: the app keeps working from its local cache and simply stops
// syncing, so a lapsed token degrades quietly instead of destroying access.
const CANDIDATE_SESSION_TTL = '90d';

// The admin panel is the opposite case — a persistent login the owner
// returns to across days, not a one-shot sign-up flow — so it gets its own,
// much longer TTL.
const ADMIN_TOKEN_TTL = '7d';

export interface PhoneVerifiedPayload {
  kind: 'phone-verified';
  phone: string;
  purpose: 'candidate' | 'guardian';
}

export interface AgeVerifiedPayload {
  kind: 'age-verified';
  phone: string;
  age: number;
  isMinor: boolean;
}

export interface AdminSessionPayload {
  kind: 'admin-session';
  adminId: string;
  email: string;
}

export interface CandidateSessionPayload {
  kind: 'candidate-session';
  phone: string;
}

export function signPhoneVerified(payload: Omit<PhoneVerifiedPayload, 'kind'>): string {
  return jwt.sign({ ...payload, kind: 'phone-verified' }, secret(), { expiresIn: TOKEN_TTL });
}

export function signAgeVerified(payload: Omit<AgeVerifiedPayload, 'kind'>): string {
  return jwt.sign({ ...payload, kind: 'age-verified' }, secret(), { expiresIn: TOKEN_TTL });
}

export function verifyPhoneVerified(token: string): PhoneVerifiedPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded === 'string' || decoded.kind !== 'phone-verified') {
    throw new Error('Invalid or expired token — go back and verify the phone number again.');
  }
  return decoded as unknown as PhoneVerifiedPayload;
}

export function verifyAgeVerified(token: string): AgeVerifiedPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded === 'string' || decoded.kind !== 'age-verified') {
    throw new Error('Invalid or expired token — go back and confirm your date of birth again.');
  }
  return decoded as unknown as AgeVerifiedPayload;
}

// Carries the phone and nothing else: it identifies whose data to serve, and
// every other attribute (age, minor status, guardian) is either already
// recorded server-side or irrelevant to that decision. Keeping it minimal
// means a leaked token discloses a phone number the holder already had.
export function signCandidateSession(payload: Omit<CandidateSessionPayload, 'kind'>): string {
  return jwt.sign({ ...payload, kind: 'candidate-session' }, secret(), { expiresIn: CANDIDATE_SESSION_TTL });
}

export function verifyCandidateSession(token: string): CandidateSessionPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded === 'string' || decoded.kind !== 'candidate-session') {
    throw new Error('Invalid or expired session.');
  }
  return decoded as unknown as CandidateSessionPayload;
}

export function signAdminSession(payload: Omit<AdminSessionPayload, 'kind'>): string {
  return jwt.sign({ ...payload, kind: 'admin-session' }, secret(), { expiresIn: ADMIN_TOKEN_TTL });
}

export function verifyAdminSession(token: string): AdminSessionPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded === 'string' || decoded.kind !== 'admin-session') {
    throw new Error('Invalid or expired admin session.');
  }
  return decoded as unknown as AdminSessionPayload;
}
