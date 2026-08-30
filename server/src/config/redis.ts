import { createClient, RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
  },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err.message));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('reconnecting', () => console.log('Redis Client Reconnecting'));

let connecting: Promise<void> | null = null;

export const connectRedis = async (): Promise<void> => {
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Failed to connect to Redis:', (err as Error).message);
      connecting = null;
      throw err;
    }
  })();
  try {
    await connecting;
  } catch {
    connecting = null;
    throw new Error('Redis unavailable');
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient.isOpen) await redisClient.quit();
};