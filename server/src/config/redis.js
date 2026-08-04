const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
  },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err.message));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('reconnecting', () => console.log('Redis Client Reconnecting'));

let connecting = null;

const connectRedis = async () => {
  if (connecting) return connecting;
  connecting = redisClient.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err.message);
    connecting = null;
    throw err;
  });
  try {
    await connecting;
  } catch {
    connecting = null;
    throw new Error('Redis unavailable');
  }
  return connecting;
};

const closeRedis = () => {
  if (redisClient.isOpen) return redisClient.quit();
  return Promise.resolve();
};

module.exports = redisClient;
module.exports.connectRedis = connectRedis;
module.exports.closeRedis = closeRedis;
