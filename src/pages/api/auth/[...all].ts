import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';

export const ALL: APIRoute = async (context) => {
  const env = context.locals.runtime.env;
  const auth = createAuth(env);
  return auth.handler(context.request);
};

export const GET = ALL;
export const POST = ALL;
