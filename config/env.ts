interface RuntimeEnv {
  WORKER_URL: string;
}

function createEnv(
  envVars: Record<keyof RuntimeEnv, string | undefined>
): RuntimeEnv {
  const config: Partial<RuntimeEnv> = {};

  for (const [key, value] of Object.entries(envVars)) {
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined.`);
    }
    config[key as keyof RuntimeEnv] = value;
  }

  return config as RuntimeEnv;
}

export const runtimeEnv = createEnv({
  WORKER_URL: process.env.WORKER_URL,
});
