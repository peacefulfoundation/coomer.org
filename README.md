# coomer.org

A full-stack Astro SSR application deployed on Cloudflare Workers.

## Stack

- **Framework**: Astro 5 (SSR) with `@astrojs/cloudflare` adapter
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite`
- **Database**: Cloudflare D1 (SQLite) with Kysely query builder
- **Auth**: better-auth with Discord OAuth
- **Video**: Mux for signed video streaming
- **Icons**: `@lucide/astro` (Astro-native components)
- **UI**: Custom Astro components using `tailwind-variants` and `class-variance-authority`

## Architecture

```
src/
├── components/           # Astro UI components
│   ├── ui/              # Base components (button, card, avatar, etc.)
│   ├── Post.astro       # Image post with donations
│   ├── CommentSection.astro
│   ├── ContentTabs.astro
│   └── ...
├── layouts/
│   └── Layout.astro     # Base HTML layout
├── lib/
│   ├── auth.ts          # better-auth configuration
│   ├── db.ts            # Kysely D1 initialization
│   ├── db.types.ts      # Database type definitions
│   ├── utils.ts         # Utilities (cn helper)
│   └── services/        # Backend services
│       ├── discord.ts   # Discord API & bot interactions
│       ├── mux.ts       # Mux video API
│       └── donations.ts # Ko-fi donation logic
├── pages/
│   ├── index.astro
│   ├── profile.astro
│   ├── [id].astro       # Dynamic post pages
│   ├── donate/complete.astro
│   └── api/             # API routes
│       ├── auth/[...all].ts
│       ├── videos/index.ts
│       ├── donate/
│       ├── comments/
│       └── discord/interactions.ts
├── styles/
│   └── global.css       # Tailwind v4 theme
└── middleware.ts        # Auth session handling
```

## Setup

### 1. Create Cloudflare Resources

```bash
# D1 Database
pnpm wrangler d1 create coomer-db

# KV Namespace (for Astro sessions)
pnpm wrangler kv namespace create SESSION
```

Update `wrangler.jsonc` with the IDs.

### 2. Run Migrations

```bash
pnpm db:migrate:local   # Local development
pnpm db:migrate:remote  # Production
```

### 3. Set Secrets

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

### 4. Development

```bash
pnpm install
pnpm dev
```

### 5. Deploy

```bash
pnpm build
pnpm wrangler pages deploy dist
```

## Type Safety

Generate binding types after modifying `wrangler.jsonc`:

```bash
pnpm cf-typegen
```

## Features

- **Discord OAuth**: Users log in with Discord
- **Ko-fi Membership**: Video access gated by Discord role
- **Donation Comments**: Comments with weighted visibility based on donation amount
- **Discord Bot**: Approval workflow via button interactions
- **Signed Video URLs**: Mux playback with JWT tokens
