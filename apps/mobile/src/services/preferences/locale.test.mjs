import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCurrency, formatDistance, isRightToLeft, normalizeLanguage, resolveLocale, translate } from './locale.mjs';

test('normalizes language tags and falls back safely', () => {
  assert.equal(normalizeLanguage('ar-MA'), 'ar');
  assert.equal(normalizeLanguage('fr_FR'), 'fr');
  assert.equal(normalizeLanguage('pt-BR'), 'en');
});

test('resolves regional locales and text direction', () => {
  assert.equal(resolveLocale('ar', 'MA'), 'ar-MA');
  assert.equal(resolveLocale('fr', 'FR'), 'fr-FR');
  assert.equal(resolveLocale('en', 'bad'), 'en-MA');
  assert.equal(isRightToLeft('ar'), true);
  assert.equal(isRightToLeft('fr'), false);
});

test('returns translated strings with an English fallback', () => {
  assert.equal(translate('ar', 'settings'), 'الإعدادات');
  assert.equal(translate('fr', 'settings'), 'Paramètres');
  assert.equal(translate('fr', 'missing-key'), 'missing-key');
});

test('formats currencies and distances using Intl', () => {
  assert.match(formatCurrency(100, 'MAD', 'fr-MA'), /100/);
  assert.match(formatDistance(10, 'mi', 'en-US'), /6\.2 mi/);
  assert.match(formatDistance(10, 'km', 'en-US'), /10 km/);
});
