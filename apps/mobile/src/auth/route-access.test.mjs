import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthRouteGuards } from './route-access.mjs';

test('keeps every guarded route unavailable while session restoration is pending', () => {
  assert.deepEqual(getAuthRouteGuards({ isLoading: true, hasSession: false }), {
    authenticated: false,
    public: false,
  });
  assert.deepEqual(getAuthRouteGuards({ isLoading: true, hasSession: true }), {
    authenticated: false,
    public: false,
  });
});

test('allows only public authentication screens when no session exists', () => {
  assert.deepEqual(getAuthRouteGuards({ isLoading: false, hasSession: false }), {
    authenticated: false,
    public: true,
  });
});

test('allows only protected application screens when a session exists', () => {
  assert.deepEqual(getAuthRouteGuards({ isLoading: false, hasSession: true }), {
    authenticated: true,
    public: false,
  });
});
