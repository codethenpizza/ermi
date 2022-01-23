import {redis} from 'config';
import {promisify} from "util";
import {createClient} from "redis";

import {CacheService} from "@core/services/cache/CacheService";

export class RedisCacheService implements CacheService {

    constructor(
        private redis = createClient(redis)
    ) {
    }

    async get(key: string): Promise<any> {
        const fn = promisify(this.redis.get).bind(this.redis);
        return JSON.parse(await fn(key));
    }

    async set(key: string, data: any): Promise<any> {
        const fn = promisify(this.redis.set).bind(this.redis);
        return fn(key, JSON.stringify(data));
    }

}
