export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: 'TRAVELER' | 'ADMIN';
  sessionId: string;
}
