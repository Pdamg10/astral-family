import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'astral-family-secret-key-change-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeaders(headers: Headers): string | null {
  const auth = headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

type AuthResult =
  | { payload: JWTPayload; response?: undefined }
  | { payload?: undefined; response: NextResponse };

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const token = getTokenFromHeaders(request.headers);
  if (!token) {
    return { response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return { response: NextResponse.json({ error: 'Sesión inválida' }, { status: 401 }) };
  }
  return { payload };
}

export async function requireAdmin(
  request: NextRequest,
  forbiddenMessage: string = 'Solo el administrador tiene permisos para esta acción'
): Promise<AuthResult> {
  const auth = await requireAuth(request);
  if (auth.response) return auth;
  if (auth.payload.role !== 'admin') {
    return { response: NextResponse.json({ error: forbiddenMessage }, { status: 403 }) };
  }
  return auth;
}
