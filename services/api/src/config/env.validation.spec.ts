import { describe, expect, it } from '@jest/globals';
import { validateEnvironment } from './env.validation.js';

const validEnvironment = {
  DATABASE_URL: 'postgresql://irife:local-only@127.0.0.1:5432/irife',
  CORS_ORIGINS: 'http://localhost:8081,https://example.test',
};

describe('validateEnvironment', () => {
  it('applies safe local defaults and parses the CORS allowlist', () => {
    expect(validateEnvironment(validEnvironment)).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: validEnvironment.DATABASE_URL,
      CORS_ORIGINS: ['http://localhost:8081', 'https://example.test'],
    });
  });

  it('rejects a missing database URL without echoing configuration values', () => {
    expect(() => validateEnvironment({})).toThrow('DATABASE_URL is required');
  });

  it('requires a valid refresh response encryption key in production', () => {
    expect(() => validateEnvironment({ ...validEnvironment, NODE_ENV: 'production' }))
      .toThrow('REFRESH_TOKEN_ENCRYPTION_KEY is required in production');
    expect(() => validateEnvironment({
      ...validEnvironment,
      NODE_ENV: 'production',
      REFRESH_TOKEN_ENCRYPTION_KEY: 'not-a-valid-key',
    })).toThrow('REFRESH_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
    expect(validateEnvironment({
      ...validEnvironment,
      NODE_ENV: 'production',
      REFRESH_TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString('base64'),
    }).REFRESH_TOKEN_ENCRYPTION_KEY).toBe(Buffer.alloc(32, 9).toString('base64'));
  });

  it('rejects invalid ports', () => {
    expect(() => validateEnvironment({ ...validEnvironment, PORT: '70000' }))
      .toThrow('PORT must be an integer between 1 and 65535');
  });

  it('rejects wildcard and non-origin CORS entries', () => {
    expect(() => validateEnvironment({ ...validEnvironment, CORS_ORIGINS: '*' }))
      .toThrow('CORS_ORIGINS must contain explicit HTTP or HTTPS origins');
    expect(() => validateEnvironment({ ...validEnvironment, CORS_ORIGINS: 'https://example.test/path' }))
      .toThrow('CORS_ORIGINS must contain explicit HTTP or HTTPS origins');
  });
});
