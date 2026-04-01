import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from '@/db';
import * as schema from '@/db/schema';

export type User = typeof schema.user.$inferSelect;
export type Session = typeof schema.session.$inferSelect;

export function createAuth(env: CloudflareEnv) {
  const db = createDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
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
        discordId: {
          type: 'string',
          required: false,
        },
        discordUsername: {
          type: 'string',
          required: false,
        },
        isKofiMember: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
        lastRoleCheck: {
          type: 'date',
          required: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    advanced: {
      generateId: () => crypto.randomUUID(),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
