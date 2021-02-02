import {createClient} from 'redis';
import {redis} from 'config';

export const RedisClient = createClient(redis);
