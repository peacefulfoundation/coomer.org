/// <reference path="../.astro/types.d.ts" />
/// <reference path="../worker-configuration.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user: import('./lib/db.types').User | null;
    session: import('./lib/db.types').Session | null;
  }
}
