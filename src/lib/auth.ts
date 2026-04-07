import { betterAuth } from 'better-auth';
import { kyselyAdapter } from '@better-auth/kysely-adapter';
import { createDb } from './db';
import type { User, Session } from './db.types';

export type { User, Session };

export function createAuth(env: CloudflareEnv) {
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
      fields: {
        emailVerified: 'email_verified',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      additionalFields: {
        discordId: { type: 'string', required: false, fieldName: 'discord_id' },
        discordUsername: {
          type: 'string',
          required: false,
          fieldName: 'discord_username',
        },
        isKofiMember: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          fieldName: 'is_kofi_member',
        },
        lastRoleCheck: {
          type: 'date',
          required: false,
          fieldName: 'last_role_check',
        },
      },
    },
    session: {
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        userId: 'user_id',
      },
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    account: {
      fields: {
        accountId: 'account_id',
        providerId: 'provider_id',
        userId: 'user_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        idToken: 'id_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    verification: {
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

type SessionLike = {
  user?: {
    id?: string | null;
  } | null;
  session?: {
    userId?: string | null;
  } | null;
} | null | undefined;

export function getSessionUserId(session: SessionLike): string | null {
  return session?.user?.id ?? session?.session?.userId ?? null;
}
