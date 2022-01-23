import {Client} from "@elastic/elasticsearch";
import {
    ApiResponse,
    Context,
    RequestBody,
    TransportRequestOptions,
    TransportRequestPromise
} from "@elastic/elasticsearch/lib/Transport";
import * as RequestParams from "@elastic/elasticsearch/api/requestParams";
import {EsScheme} from "@core/services/elastic/schemas/types";

export abstract class ElasticIndexService {

    constructor(
        protected client: Client,
        protected index: string,
        protected schemas: EsScheme.Scheme[],
        protected normalizers: Object,
        protected type = '_doc',
        protected maxConnectionRetries = 10
    ) {
    }

    getByID<TResponse = Record<string, any>, TContext = Context>(id: string | number): Promise<TResponse | null> {
        return this.client.get({
            index: this.index,
            id: id.toString(),
        })
            .then(x => x.body._source)
            .catch((e) => {
                if (e.meta.statusCode === 404) {
                    return null;
                }

                throw e;
            });
    }

    search<TResponse = Record<string, any>, TRequestBody extends RequestBody = Record<string, any>, TContext = Context>(params?: RequestParams.Search<TRequestBody>, options?: TransportRequestOptions): TransportRequestPromise<ApiResponse<TResponse, TContext>> {
        params = params || {};
        return this.client.search({
            ...params,
            index: this.index,
            type: this.type,
        });
    }

    checkConnection() {
        return new Promise(async (resolve) => {
            console.log("Checking connection to ElasticSearch...");
            let isConnected = false;
            let maxRetries = this.maxConnectionRetries;
            while (!isConnected) {
                try {
                    await this.client.cluster.health({});
                    console.log("Successfully connected to ElasticSearch");
                    isConnected = true;
                } catch (e) {
                    maxRetries--;
                    console.log('Error', e);
                    console.log('Trying to reconnect...');
                    if (!maxRetries) {
                        throw new Error('Elastic search connection error');
                    }
                }
            }
            resolve(true);
        });
    }

    async initIndex(): Promise<void> {
        await this.createIndex();

        const settings = this.createSettings();
        if (settings) {
            await this.setSettings(settings);
        }

        const schema = this.getMapping();
        if (schema) {
            await this.setQuotesMapping(schema);
        }
    }

    async createIndex(): Promise<void> {
        try {
            await this.client.indices.create({index: this.index});
            console.log(`Created index ${this.index}`);
        } catch (err) {
            console.log(`Index "${this.index}" already exists`);
        }
    }

    async resetIndex() {
        try {
            await this.client.indices.close({index: this.index});
            await this.client.indices.delete({index: this.index});
        } catch (e) {
            if (e?.meta?.body?.error?.type !== 'index_not_found_exception') {
                throw e;
            }
        }

        await this.initIndex();
    }

    async wipeIndex() {
        return this.client.delete_by_query({
            index: this.index,
            type: this.type,
            body: {
                "query": {
                    "bool": {
                        "must_not": {
                            "term": {
                                "id": 0
                            }
                        }
                    }
                }
            }
        })
    }

    async findByIds(ids: number[], byGet = false) {
        if (byGet) {
            return Promise.all(ids.map(id => this.getByID(id)));
        }

        return this.client.search({
            body: {
                query: {
                    terms: {
                        "_id": ids
                    }
                }
            }
        })
            .then(x => x.body._source || [])
            .catch((e) => {
                if (e.meta.statusCode === 404) {
                    return null;
                }

                throw e;
            });
    }

    bulkCreate(data: { id: number; [x: string]: any }[]) {
        const body = [];

        for (const item of data) {

            const esAction = {
                index: {
                    _index: this.index,
                    _type: this.type,
                    _id: item.id
                }
            };

            body.push(esAction);
            body.push(item);
        }

        return this.client.bulk({
            body
        }).catch((e) => {
            console.log('ERROR', JSON.stringify(e));
        });
    }

    update(data: { id: number; [x: string]: any }) {
        return this.client.index({
            index: this.index,
            // type: this.type,
            id: data.id.toString(),
            body: data,
        });
    }

    async bulkUpdate(data: Object & { id: number }[]): Promise<void> {
        for (const item of data) {
            await this.client.index({
                index: this.index,
                type: this.type,
                id: item.id.toString(),
                body: item,
            }).catch(e => JSON.stringify(e));
        }
    }

    destroy(id: number) {
        return this.client.delete({
            index: this.index,
            id: id.toString()
        });
    }

    protected abstract createSettings(): Object;

    protected abstract getMapping(): EsScheme.Scheme;

    private async setSettings(settings: Object) {
        try {
            await this.client.indices.close({
                index: this.index
            });
            await this.client.indices.putSettings({
                index: this.index,
                body: settings
            });
            await this.client.indices.open({
                index: this.index
            });
            console.log("Settings created successfully");
        } catch (err) {
            console.error("An error occurred while setting the settings:");
            console.error(JSON.stringify(settings), err);
            throw err;
        }
    }

    private async setQuotesMapping(schema: Object) {
        try {
            await this.client.indices.putMapping({
                index: this.index,
                type: this.type,
                include_type_name: true,
                body: {
                    properties: schema,
                },
            });

            console.log("Quotes mapping created successfully");
        } catch (err) {
            console.error("An error occurred while setting the quotes mapping:");
            console.error(JSON.stringify(err), schema);
            throw err;
        }
    }

}
