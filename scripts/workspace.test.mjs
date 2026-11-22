import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const apiManifestPath = new URL('../services/api/package.json', import.meta.url);

test('root npm workspaces include mobile, API, and shared contracts', () => {
  assert.deepEqual(
    new Set(root.workspaces),
    new Set(['apps/mobile', 'services/api', 'packages/contracts']),
  );
});

test('API workspace exists and exposes the required lifecycle scripts', () => {
  assert.equal(existsSync(apiManifestPath), true, 'services/api/package.json must exist');
  const api = JSON.parse(readFileSync(apiManifestPath, 'utf8'));
  assert.equal(api.name, '@irife/api');
  for (const script of ['start', 'start:dev', 'build', 'typecheck', 'test', 'test:e2e']) {
    assert.ok(api.scripts?.[script], `API workspace must define ${script}`);
  }
});
