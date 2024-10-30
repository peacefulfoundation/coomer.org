interface RuntimeEnv {
  WORKER_URL: string;
  CDN_URL: string;
}

function createEnv(): RuntimeEnv {
  if (typeof window === 'undefined') {
    require('dotenv').config({ path: '.env' });
  }

  const config: Partial<RuntimeEnv> = {
    WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
    CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  };

  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not defined.`);
    }
  }

  return config as RuntimeEnv;
}

export const runtimeEnv = createEnv();
