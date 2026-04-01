# coomer.org

A meme curation platform built with Astro, deployed on Cloudflare Workers with D1 database.

## Features

- **Image Memes**: Infinite scroll of curated memes from external API
- **Video Memes**: Exclusive video content for Ko-fi monthly supporters (via Mux)
- **Discord OAuth**: Login with Discord using better-auth
- **Ko-fi Membership Verification**: Automatic role checking via Discord API
- **Profile Management**: View subscription status and refresh membership
- **Donation Comments**: Users can donate via Ko-fi and leave comments on posts
  - Comments require Discord login before donating
  - Weighted visibility based on donation amount (higher = longer visibility)
  - Admin approval via Discord bot with approve/reject buttons
  - Comments fade over time as they approach expiry

## Tech Stack

- **Framework**: [Astro](https://astro.build) with React islands
- **Auth**: [better-auth](https://better-auth.com) with Discord OAuth
- **Database**: Cloudflare D1 with Drizzle ORM
- **Video**: Mux with signed playback tokens
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Cloudflare Workers

## Prerequisites

- Node.js 18+ with pnpm
- Cloudflare account with Workers plan
- Discord application (for OAuth)
- Mux account (for video hosting)
- Ko-fi account with Discord integration

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create D1 Database

```bash
pnpm wrangler d1 create coomer-db
```

Copy the database ID to `wrangler.toml`.

### 3. Create KV Namespace (for Astro sessions)

```bash
pnpm wrangler kv namespace create SESSION
```

Copy the KV namespace ID to `wrangler.toml`.

### 4. Run Database Migrations

```bash
# Local development
pnpm run db:migrate:local

# Production
pnpm run db:migrate:remote
```

### 5. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

For production, set secrets via Wrangler:

```bash
pnpm wrangler secret put DISCORD_CLIENT_ID
pnpm wrangler secret put DISCORD_CLIENT_SECRET
pnpm wrangler secret put BETTER_AUTH_SECRET
pnpm wrangler secret put MUX_TOKEN_ID
pnpm wrangler secret put MUX_TOKEN_SECRET
pnpm wrangler secret put MUX_SIGNING_KEY_ID
pnpm wrangler secret put MUX_SIGNING_KEY_PRIVATE
pnpm wrangler secret put DISCORD_BOT_TOKEN
pnpm wrangler secret put DISCORD_PUBLIC_KEY
pnpm wrangler secret put KOFI_VERIFICATION_TOKEN
```

### 6. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URL: `https://your-domain.com/api/auth/callback/discord`
5. Copy Client ID and Client Secret
6. Enable the following OAuth2 scopes:
   - `identify`
   - `email`
   - `guilds.members.read`

### 7. Mux Setup

1. Create a Mux account at [mux.com](https://mux.com)
2. Get your API Token ID and Secret from Settings > API Access Tokens
3. Create a signing key for secure playback:
   - Go to Settings > Signing Keys
   - Create a new key
   - Copy the Key ID and Private Key

### 8. Discord Bot Setup (for Comment Approval)

1. In Discord Developer Portal, go to your application
2. Go to "Bot" section and create a bot
3. Copy the Bot Token
4. Go to "General Information" and copy the Public Key
5. Enable these Privileged Gateway Intents:
   - Message Content Intent (if needed)
6. Go to OAuth2 > URL Generator:
   - Select `bot` and `applications.commands` scopes
   - Select permissions: `Send Messages`, `Embed Links`
   - Use the generated URL to add the bot to your server
7. Set your Interactions Endpoint URL to: `https://your-domain.com/api/discord/interactions`

### 9. Ko-fi Webhook Setup

1. Go to [Ko-fi Webhooks](https://ko-fi.com/manage/webhooks)
2. Set the webhook URL to: `https://your-domain.com/api/donate/webhook`
3. Copy the Verification Token and set it as `KOFI_VERIFICATION_TOKEN`

## Development

```bash
pnpm run dev
```

This starts the Astro dev server with Cloudflare bindings simulation.

## Deployment

```bash
pnpm run build
pnpm wrangler deploy
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SITE_URL` | Your site's base URL |
| `WORKER_URL` | External meme API URL |
| `CDN_URL` | CDN URL for images |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret |
| `DISCORD_GUILD_ID` | Your Discord server ID |
| `DISCORD_KOFI_ROLE_ID` | Ko-fi member role ID in Discord |
| `DISCORD_BOT_TOKEN` | Discord bot token for approval messages |
| `DISCORD_PUBLIC_KEY` | Discord app public key for interactions |
| `DISCORD_APPROVAL_CHANNEL_ID` | Channel ID for comment approval |
| `BETTER_AUTH_SECRET` | Random secret for session encryption |
| `MUX_TOKEN_ID` | Mux API token ID |
| `MUX_TOKEN_SECRET` | Mux API token secret |
| `MUX_SIGNING_KEY_ID` | Mux signing key ID |
| `MUX_SIGNING_KEY_PRIVATE` | Mux signing key private key |
| `KOFI_USERNAME` | Your Ko-fi username |
| `KOFI_VERIFICATION_TOKEN` | Ko-fi webhook verification token |

## Project Structure

```
src/
├── components/         # React components (islands)
│   ├── ui/            # shadcn/ui components
│   ├── Post.tsx       # Image post component
│   ├── VideoPost.tsx  # Video post component
│   ├── PostList.tsx   # Infinite scroll for images
│   ├── VideoList.tsx  # Infinite scroll for videos
│   ├── ContentTabs.tsx # Main tab navigation
│   └── ...
├── db/                # Database schema and utilities
├── layouts/           # Astro layouts
├── lib/              # Utilities and auth config
├── pages/            # Astro pages and API routes
│   ├── api/
│   │   ├── auth/     # better-auth endpoints
│   │   ├── videos/   # Video API (auth-gated)
│   │   ├── donate/   # Donation flow (intent, webhook, pending)
│   │   ├── comments/ # Comment submission and retrieval
│   │   ├── discord/  # Discord interactions endpoint
│   │   └── subscription/ # Subscription refresh
│   ├── donate/       # Donation completion page
│   └── ...
└── styles/           # Global CSS
migrations/           # D1 SQL migrations
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm db:migrate:local` | Apply migrations to local D1 |
| `pnpm db:migrate:remote` | Apply migrations to production D1 |

## License

MIT
