import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cybershield-fallback-secret-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export interface ResetTokenPayload {
  userId: string;
  email: string;
  purpose: 'password_reset';
}

export function signResetToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });
}

export function verifyResetToken(token: string): ResetTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    if (decoded.purpose !== 'password_reset') return null;
    return decoded;
  } catch {
    return null;
  }
}

