import { createHash, randomBytes } from 'node:crypto';

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  // Reset tokens contain 256 bits of cryptographic randomness; SHA-256 is used only to store a token verifier, never a human password.
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
