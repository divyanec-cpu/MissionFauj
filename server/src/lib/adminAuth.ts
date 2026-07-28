import type { Request, Response, NextFunction } from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { signAdminSession, verifyAdminSession, type AdminSessionPayload } from './jwt.js';

const COOKIE_NAME = 'admin_session';
const SCRYPT_KEYLEN = 64;

// scrypt over jsonwebtoken's own dependency-free crypto — no bcrypt/argon2
// dependency needed. Stored as "saltHex:hashHex".
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

export function setAdminCookie(req: Request, res: Response, token: string): void {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${secure}`,
  );
}

export function clearAdminCookie(req: Request, res: Response): void {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
}

export interface AdminRequest extends Request {
  admin?: AdminSessionPayload;
}

// Redirects to the login form rather than returning a bare 401 — every route
// behind this is an HTML page meant to be browsed, not an API a script calls.
export function requireAdminSession(req: AdminRequest, res: Response, next: NextFunction): void {
  const token = readCookie(req, COOKIE_NAME);
  if (!token) {
    res.redirect('/admin/login');
    return;
  }
  try {
    req.admin = verifyAdminSession(token);
    next();
  } catch {
    res.redirect('/admin/login');
  }
}
