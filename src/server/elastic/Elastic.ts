import {ApiResponse, Client, RequestParams} from '@elastic/elasticsearch';
import {elastic} from 'config';
import {TransportRequestOptions, TransportRequestPromise} from "@elastic/elasticsearch/lib/Transport";


const node = `${elastic.protocol}://${elastic.host}${elastic.port ? ':' + elastic.port : ''}`
export const esClient = new Client({node});

export class Elastic {

    constructor(
        private index: string,
        private type = '_doc'
    ) {
    }

    static checkConnection() {
        return new Promise(async (resolve) => {
            console.log("Checking connection to ElasticSearch...");
            let isConnected = false;
            while (!isConnected) {
                try {
                    await esClient.cluster.health({});
                    console.log("Successfully connected to ElasticSearch");
                    isConnected = true;
                } catch (e) {
                    console.log('Error', e);
                    console.log('Trying to reconnect...');
                }
            }
            resolve(true);
        });
    }

    async createIndex() {
        try {
            await esClient.indices.create({index: this.index});
            console.log(`Created index ${this.index}`);
        } catch (err) {
            console.log(`Index "${this.index}" already exists`);
        }
    }

    async setSettings(settings: Object) {
        try {
            await esClient.indices.close({
                index: this.index
            });
            await esClient.indices.putSettings({
                index: this.index,
                body: settings
            });
            await esClient.indices.open({
                index: this.index
            });
            console.log("Settings created successfully");
        } catch (err) {
            console.error("An error occurred while setting the settings:");
            console.error(JSON.stringify(err));
        }
    }

    async setQuotesMapping(schema: Object) {
        try {
            await esClient.indices.putMapping({
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
            console.error(JSON.stringify(err));
        }
    }

    async clearIndex() {
        return esClient.delete_by_query({
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

    async bulkCreate(data: Object & { id: number }[]) {
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

        return esClient.bulk({
            body
        }).catch((e) => {
            console.log('ERROR', JSON.stringify(e));
        });
    }

    update(data: { [x: string]: any } & { id: number }) {
        return esClient.index({
            index: this.index,
            // type: this.type,
            id: data.id.toString(),
            body: data,
        });
    }

    async bulkUpdate(data: Object & { id: number }[]) {
        for (const item of data) {
            await esClient.index({
                index: this.index,
                type: this.type,
                id: item.id.toString(),
                body: item,
            }).catch(e => JSON.stringify(e));
        }
    }

    destroy(id: number) {
        return esClient.delete({
            index: this.index,
            id: id.toString()
        });
    }

    async search(params?: RequestParams.Search, options?: TransportRequestOptions): Promise<TransportRequestPromise<ApiResponse>> {
        return esClient.search({
            index: this.index,
            // type: this.type,
            ...params
        }, options).catch(e => {
            console.log('ES SEARCH ERROR', JSON.stringify(e));
            throw e;
        });
    }

    async get(id: string): Promise<TransportRequestPromise<ApiResponse>> {
        return esClient.get({
            index: this.index,
            id
        }).catch((e) => {
            if (e.meta.statusCode === 404) {
                return null;
            }

            throw e;
        });
    }

}
