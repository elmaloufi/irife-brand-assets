export interface AuthenticatedUser {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  displayName: string;
  role: 'TRAVELER' | 'ADMIN';
  sessionId: string;
}
