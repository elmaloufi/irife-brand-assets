import { describe, expect, it } from '@jest/globals';
import { hashPassword, verifyPassword } from './password-hasher.js';
import { createOpaqueToken, hashToken } from './token.util.js';

describe('identity cryptographic helpers', () => {
  it('stores a one-way scrypt password hash and verifies only the correct password', async () => {
    const encoded = await hashPassword('correct horse battery staple');
    expect(encoded).toMatch(/^scrypt\$32768\$8\$1\$/);
    expect(encoded).not.toContain('correct horse');
    await expect(verifyPassword('correct horse battery staple', encoded)).resolves.toBe(true);
    await expect(verifyPassword('incorrect password', encoded)).resolves.toBe(false);
  });

  it('rejects malformed or unsupported password hash formats', async () => {
    await expect(verifyPassword('anything', 'plaintext')).resolves.toBe(false);
    await expect(verifyPassword('anything', 'argon2$bad')).resolves.toBe(false);
  });

  it('generates high-entropy opaque tokens and stores only stable SHA-256 digests', () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(hashToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(first)).toBe(hashToken(first));
    expect(hashToken(first)).not.toBe(first);
  });
});
