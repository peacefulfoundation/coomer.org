'use server';

import { runtimeEnv } from '@/config/env';

export async function getImage(number: number) {
  const response = await fetch(
    runtimeEnv.WORKER_URL + '/coomer-' + ('000' + number).slice(-3) + '.jpg'
  );

  return response.body;
}
