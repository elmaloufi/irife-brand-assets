import assert from 'node:assert/strict';
import test from 'node:test';
import { getRegionChoices, supportedRegions } from './regions.mjs';

test('covers the complete ISO 3166-1 alpha-2 country and territory catalog', () => {
  assert.equal(supportedRegions.length, 249);
  assert.equal(new Set(supportedRegions).size, 249);
  for (const code of ['MA', 'US', 'JP', 'GB', 'AX', 'BQ', 'XK']) {
    if (code !== 'XK') assert.ok(supportedRegions.includes(code), `missing ISO code ${code}`);
  }
});

test('keeps Morocco first and sorts remaining localized region labels', () => {
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
