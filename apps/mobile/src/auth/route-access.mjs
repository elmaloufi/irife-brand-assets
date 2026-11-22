const PUBLIC_AUTH_ROUTES = new Set(['sign-in', 'register', 'reset-password']);

export function getAuthRedirect({ isLoading, hasSession, segments }) {
  if (isLoading) return null;

  const [rootSegment, authScreen] = segments;
  const isAuthRoute = rootSegment === 'auth';
  const isPublicAuthRoute = isAuthRoute && PUBLIC_AUTH_ROUTES.has(authScreen);

  if (!hasSession && !isPublicAuthRoute) return '/auth/sign-in';
  if (hasSession && isAuthRoute) return '/(tabs)';

  return null;
}
