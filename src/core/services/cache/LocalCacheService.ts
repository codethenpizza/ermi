import {CacheService} from "@core/services/cache/CacheService";
import NodeCache from 'node-cache';

export class LocalCacheService implements CacheService {

    constructor(
        private client = new NodeCache()
    ) {
    }

    async get(key: string): Promise<any> {
        return this.client.get(key);
    }

    async set(key: string, data: any): Promise<any> {
        return this.client.set(key, data);
    }

}
