import assert from 'node:assert/strict';
import test from 'node:test';
import { getRegionChoices, supportedRegions } from './regions.mjs';

test('provides a broad ISO region starter catalog with Morocco first', () => {
  const choices = getRegionChoices('en-MA');
  assert.ok(choices.length >= 70);
  assert.equal(choices[0].value, 'MA');
  assert.ok(supportedRegions.includes('US'));
  assert.ok(supportedRegions.includes('JP'));
});

test('localizes country labels for the requested locale when Intl supports it', () => {
  const french = getRegionChoices('fr-FR');
  const morocco = french.find((choice) => choice.value === 'MA');
  assert.ok(morocco);
  assert.notEqual(morocco.label, 'MA');
});
