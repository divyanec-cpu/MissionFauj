import jwt from 'jsonwebtoken';

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set. Copy .env.example to .env and configure it.');
  return s;
}

// Short-lived on purpose: these tokens only need to survive one sign-up
// session (a few minutes across a handful of screens), never a return visit —
// MissionFauj has no other authenticated backend surface to protect.
const TOKEN_TTL = '20m';

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
