import IORedis from 'ioredis';

if (!process.env.REDIS_URL) {
  console.warn('⚠️  REDIS_URL not set. Redis features will be unavailable.');
}

export const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // required for BullMQ
  enableReadyCheck: false,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});
