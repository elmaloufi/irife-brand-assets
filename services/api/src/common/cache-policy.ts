export function isPrivateApiPath(path: string): boolean {
  const normalizedPath = path.toLowerCase().replace(/\/+$/, '') || '/';
  return normalizedPath.startsWith('/api/v1/identity') ||
    normalizedPath.startsWith('/api/v1/me/') ||
    normalizedPath.startsWith('/api/v1/enquiries');
}
