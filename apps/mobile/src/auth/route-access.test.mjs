import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthRedirect } from './route-access.mjs';

test('waits for session restoration before deciding where to navigate', () => {
  assert.equal(getAuthRedirect({ isLoading: true, hasSession: false, segments: [] }), null);
});

test('sends unauthenticated visitors to cinematic sign-in from protected routes', () => {
  assert.equal(getAuthRedirect({ isLoading: false, hasSession: false, segments: ['(tabs)', 'index'] }), '/auth/sign-in');
});

test('allows unauthenticated visitors to use sign-in, registration and password recovery', () => {
  for (const segments of [['auth', 'sign-in'], ['auth', 'register'], ['auth', 'reset-password']]) {
    assert.equal(getAuthRedirect({ isLoading: false, hasSession: false, segments }), null);
  }
});

test('sends authenticated visitors away from public auth screens into the app', () => {
  for (const segments of [['auth', 'sign-in'], ['auth', 'register'], ['auth', 'reset-password']]) {
    assert.equal(getAuthRedirect({ isLoading: false, hasSession: true, segments }), '/(tabs)');
  }
});

test('keeps authenticated visitors on protected app routes', () => {
  assert.equal(getAuthRedirect({ isLoading: false, hasSession: true, segments: ['(tabs)', 'discover'] }), null);
});
