import {createClient} from 'redis';
import {redis, cacheStrategy} from 'config';

export const RedisClient = cacheStrategy === 'redis' ? createClient(redis) : null;
