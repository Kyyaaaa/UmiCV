import { RedisOptions } from 'ioredis';
import { env } from './env';

export const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  maxRetriesPerRequest: null,
};
