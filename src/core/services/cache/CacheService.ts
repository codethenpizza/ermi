import {cacheStrategy} from 'config';
import {LocalCacheService} from "@core/services/cache/LocalCacheService";
import {RedisCacheService} from "@core/services/cache/RedisCacheService";

export interface CacheService {
    get(key: string): Promise<any>;

    set(key: string, data: any): Promise<any>;
}

export const getCacheService = (): CacheService => {
    switch (cacheStrategy) {
        case 'redis':
            return new RedisCacheService();
        case 'local':
        default:
            return new LocalCacheService();
    }
}
