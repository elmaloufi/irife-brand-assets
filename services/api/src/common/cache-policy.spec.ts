import { describe, expect, it } from '@jest/globals';
import { isPrivateApiPath } from './cache-policy.js';

describe('private API cache policy', () => {
  it.each([
    '/api/v1/identity/me',
    '/API/V1/IDENTITY/ME/',
    '/api/v1/me/enquiries',
    '/API/V1/ME/SAVED-EXPERIENCES/',
    '/api/v1/enquiries/',
  ])('marks sensitive path variants as private and non-cacheable: %s', (path) => {
    expect(isPrivateApiPath(path)).toBe(true);
  });

  it.each([
    '/api/v1/health',
    '/api/v1/destinations',
    '/api/v1/experiences',
  ])('does not mark public catalogue paths as private: %s', (path) => {
    expect(isPrivateApiPath(path)).toBe(false);
  });
});
