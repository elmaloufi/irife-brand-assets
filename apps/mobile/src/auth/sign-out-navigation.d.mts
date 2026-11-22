export function signOutAndNavigate(
  signOut: () => Promise<unknown>,
  navigate: () => void,
  onFailure: (error: unknown) => void,
): Promise<void>;
