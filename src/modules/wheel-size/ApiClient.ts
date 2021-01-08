import axios from 'axios'
import {Make, Model, SByModelResp, Year} from "./types";

export class WheelSizeApiClient {

    private url = `https://api.wheel-size.com/${this.version}`;

    constructor(
        private apiKey: string,
        private version = 'v1'
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
        const apiClient = axios.create({
            baseURL: this.url,
            responseType: "json",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        params = this.setParams(params);

        const resp = await apiClient.get<T>(url, {
            params
        });

        return resp.data;
    }

    private setParams(params: Object): Object {
        return {
            ...params,
            user_key: this.apiKey
        };
    }
}
