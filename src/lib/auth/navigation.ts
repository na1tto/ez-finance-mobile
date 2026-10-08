/** Destinations are local and selected only from validated Auth state. */
export function authDestination(status: string, pathname: string): '/' | '/auth/reset-password' | null {
  if (status === 'recovery') return pathname === '/auth/reset-password' ? null : '/auth/reset-password';
  if (status === 'authenticated' && ['/auth/sign-in', '/auth/sign-up', '/auth/email-link', '/auth/callback', '/auth/reset-password'].includes(pathname)) return '/';
  return null;
}
