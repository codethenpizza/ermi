import {Client} from 'es7';
import {elastic} from 'config';
import * as RequestParams from "es7/api/requestParams";
import {ApiResponse, Context, RequestBody, TransportRequestOptions, TransportRequestPromise} from "es7/lib/Transport";

export const esClient = new Client({node: `http://${elastic.host}:${elastic.port}`});

export class Elastic {

    constructor(
        private index: string,
        private type: string
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
                } catch (_) {
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

    async setQuotesMapping(schema: Object) {
        try {
            await esClient.indices.putMapping({
                index: this.index,
                type: this.type,
                include_type_name: true,
                body: {
                    properties: schema
                }
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

    async search(params?: RequestParams.Search, options?: TransportRequestOptions): Promise<TransportRequestPromise<ApiResponse>> {
        return esClient.search({
            index: this.index,
            type: this.type,
            ...params
        }, options);
    }

}
