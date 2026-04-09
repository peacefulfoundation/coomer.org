import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from "@/db/base-schema";

import { env } from 'cloudflare:workers';
import { db } from '@/lib/db';

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema
    }),
    socialProviders: {
        discord: {
            clientId: env.DISCORD_CLIENT_ID!,
            clientSecret: env.DISCORD_CLIENT_SECRET!,
            scope: ['identify', 'email', 'guilds.members.read'],
            mapProfileToUser: (profile) => ({
                discordId: profile.id,
                discordUsername: profile.username,
            }),
        },
    }
});