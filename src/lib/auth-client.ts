import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_SITE_URL || '',
  basePath: '/api/auth',
});

export const { signIn, signOut, useSession } = authClient;
