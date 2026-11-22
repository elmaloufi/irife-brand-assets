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
