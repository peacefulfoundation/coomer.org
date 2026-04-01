/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;

interface CloudflareEnv {
  DB: D1Database;
  SITE_URL: string;
  WORKER_URL: string;
  CDN_URL: string;
  
  // Discord OAuth
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_GUILD_ID: string;
  DISCORD_KOFI_ROLE_ID: string;
  
  // Discord Bot (for comment approval)
  DISCORD_BOT_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APPROVAL_CHANNEL_ID: string;
  
  // Auth
  BETTER_AUTH_SECRET: string;
  
  // Mux Video
  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  MUX_SIGNING_KEY_ID: string;
  MUX_SIGNING_KEY_PRIVATE: string;
  
  // Ko-fi
  KOFI_USERNAME: string;
  KOFI_VERIFICATION_TOKEN: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {
    user: import('./src/lib/auth').User | null;
    session: import('./src/lib/auth').Session | null;
  }
}
