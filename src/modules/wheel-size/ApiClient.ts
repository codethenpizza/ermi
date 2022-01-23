import axios from 'axios'
import {Make, Model, SByModelResp, Year} from "./types";
import {getCacheService} from "@core/services/cache/CacheService";

export class WheelSizeApiClient {

    private url = `https://api.wheel-size.com/${this.version}`;

    constructor(
        private apiKey: string,
        private version = 'v1',
        private cache = getCacheService()
    ) {
    }

    async getMakes(): Promise<Make[]> {
        return this.request<Make[]>('/makes/');
    }

    async getYears(make: string): Promise<Year[]> {
        return this.request<Year[]>('/years/', {make});
    }

    async getModels(make: string, year: string): Promise<Model[]> {
        return this.request<Model[]>('/models/', {make, year});
    }

    async searchByModel(make: string, year: string, model: string): Promise<SByModelResp[]> {
        return this.request<SByModelResp[]>('/search/by_model/', {make, year, model});
    }

    private async request<T>(url: string, params: any = {}): Promise<T> {
        params = this.setParams(params);

        const cacheKey = `wheel-size-cache_${url}_${JSON.stringify(params)}`;
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const apiClient = axios.create({
            baseURL: this.url,
            responseType: "json",
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip'
            }
        });


        try {
            const resp = await apiClient.get<T>(url, {
                params
            });

            await this.cache.set(cacheKey, resp.data);

            return resp.data;
        } catch (e) {
            console.log('ERROR', e);
            return [] as unknown as T;
        }
    }

    private setParams(params: Object): Object {
        return {
            ...params,
            user_key: this.apiKey
        };
    }
}
