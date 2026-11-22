const PUBLIC_AUTH_ROUTES = new Set(['sign-in', 'register', 'reset-password']);

export function getAuthRedirect({ isLoading, hasSession, segments }) {
  if (isLoading) return null;

  const [rootSegment, authScreen] = segments;
  const isPublicAuthRoute = rootSegment === 'auth' && PUBLIC_AUTH_ROUTES.has(authScreen);

  if (!hasSession && !isPublicAuthRoute) return '/auth/sign-in';
  if (hasSession && isPublicAuthRoute) return '/(tabs)';

  return null;
}
