import {CacheStrategy} from "@core/cache/CacheStrategy";
import NodeCache from 'node-cache';

export class LocalStrategy implements CacheStrategy {

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
