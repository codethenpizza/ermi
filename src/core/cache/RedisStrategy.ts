import {CacheStrategy} from "@core/cache/CacheStrategy";
import {RedisClient} from "@server/Redis";
import {promisify} from "util";

export class RedisStrategy implements CacheStrategy {

    constructor(
        private setAsync = promisify(RedisClient.set).bind(RedisClient),
        private getAsync = promisify(RedisClient.get).bind(RedisClient)
    ) {
    }

    async get(key: string): Promise<any> {
        return JSON.parse(await this.getAsync(key));
    }

    async set(key: string, data: any): Promise<any> {
        return this.setAsync(key, JSON.stringify(data));
    }

}
