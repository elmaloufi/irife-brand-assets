import assert from 'node:assert/strict';
import test from 'node:test';
import { signOutAndNavigate } from './sign-out-navigation.mjs';

test('waits for a successful sign-out before navigating', async () => {
  const events = [];
  await signOutAndNavigate(
    async () => { events.push('sign-out'); },
    () => { events.push('navigate'); },
    () => { events.push('error'); },
  );
  assert.deepEqual(events, ['sign-out', 'navigate']);
});

test('reports a failed remote sign-out and still navigates after local cleanup', async () => {
  const events = [];
  const failure = new Error('network unavailable');
  await signOutAndNavigate(
    async () => { events.push('sign-out'); throw failure; },
    () => { events.push('navigate'); },
    (error) => { events.push(error); },
  );
  assert.deepEqual(events, ['sign-out', failure, 'navigate']);
});
