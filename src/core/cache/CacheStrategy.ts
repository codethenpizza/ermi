import {cacheStrategy} from 'config';
import {LocalStrategy} from "@core/cache/LocalStrategy";
import {RedisStrategy} from "@core/cache/RedisStrategy";

export interface CacheStrategy {
    get(key: string): Promise<any>;
    set(key: string, data: any): Promise<any>;
}

export const getCacheStrategy = (): CacheStrategy => {
    switch (cacheStrategy) {
        case 'redis':
            return new RedisStrategy();
        case 'local':
        default:
            return new LocalStrategy();
    }
}
