import { betterAuth } from 'better-auth';
import { kyselyAdapter } from '@better-auth/kysely-adapter';
import { createDb } from './db';
import type { User, Session } from './db.types';

export type { User, Session };

export function createAuth(env: Env) {
  const db = createDb(env.DB);

  return betterAuth({
    database: kyselyAdapter(db, {
      type: 'sqlite',
    }),
    baseURL: env.SITE_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        scope: ['identify', 'email', 'guilds.members.read'],
        mapProfileToUser: (profile) => ({
          discordId: profile.id,
          discordUsername: profile.username,
        }),
      },
    },
    user: {
      additionalFields: {
        discordId: { type: 'string', required: false },
        discordUsername: { type: 'string', required: false },
        isKofiMember: { type: 'boolean', required: false, defaultValue: false },
        lastRoleCheck: { type: 'date', required: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    advanced: {
      generateId: () => crypto.randomUUID(),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
