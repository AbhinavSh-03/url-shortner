import { createClient } from 'redis';
import { env } from './env';

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (err) {
    console.error('Redis health check failed', err);
    return false;
  }
}
