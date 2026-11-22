export async function restoreSessionWithFallback(storedSession, restore) {
  if (!storedSession) return null;
  try {
    return await restore(storedSession);
  } catch {
    // A transport or server failure is not proof that the refresh credential
    // is invalid. Keep the encrypted local session and retry on next use.
    return storedSession;
  }
}
