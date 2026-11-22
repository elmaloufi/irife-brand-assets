import assert from 'node:assert/strict';
import test from 'node:test';
import { getRegionChoices, supportedRegions } from './regions.mjs';

test('covers the complete ISO 3166-1 alpha-2 country and territory catalog', () => {
  assert.equal(supportedRegions.length, 249);
  assert.equal(new Set(supportedRegions).size, 249);
  assert.ok(supportedRegions.every((code) => /^[A-Z]{2}$/.test(code)));
  for (const code of ['MA', 'US', 'JP', 'GB', 'AX', 'BQ']) {
    assert.ok(supportedRegions.includes(code), `missing ISO code ${code}`);
  }
});

test('keeps Morocco first and returns every localized region choice', () => {
  const choices = getRegionChoices('en-MA');
  assert.equal(choices.length, 249);
  assert.equal(choices[0].value, 'MA');
  assert.ok(choices.some((choice) => choice.value === 'US'));
  assert.ok(choices.some((choice) => choice.value === 'JP'));
});

test('localizes country labels for the requested locale when Intl supports it', () => {
  const french = getRegionChoices('fr-FR');
  const morocco = french.find((choice) => choice.value === 'MA');
  assert.ok(morocco);
  assert.notEqual(morocco.label, 'MA');
});
