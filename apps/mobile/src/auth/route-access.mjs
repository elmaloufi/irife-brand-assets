export function getAuthRouteGuards({ isLoading, hasSession }) {
  return {
    authenticated: !isLoading && hasSession,
    public: !isLoading && !hasSession,
  };
}
