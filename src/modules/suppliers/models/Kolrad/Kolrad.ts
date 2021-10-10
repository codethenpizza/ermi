import config from 'config';
import request from 'request';
import XmlStream from 'xml-stream';

import {STOCK_MSK, Supplier} from "../../types";
import {RimMap, RimStock, SupplierRim} from "../../helpers/rimProductType/rimTypes";
import Product from "@models/Product.model";
import KolradModel, {IKolrad} from "./Kolrad.model";
import progressBar from "../../../../helpers/progressBar";
import parseDouble from "../../../../helpers/parseDouble";
import {rimType} from "../../helpers/constants";
import ParsedStocks = IKolrad.ParsedStocks;

export class Kolrad implements Supplier, SupplierRim {
    readonly name = 'kolrad';

    async fetchData(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            console.log('Start fetch Kolrad');

            const {host, token, contractNum} = config.get('suppliers.Kolrad.api');
            const baseUrl = `${host}`;
            const params = `${contractNum}/?token=${token}`

            let counter = 0;
            let totalPages = 0;

            try {
                const url = `${baseUrl}/page0/${params}`
                totalPages = await this.getTotalPages(url)

                if (!totalPages) {
                    console.log('total pages is empty')
                    return;
                }

                for (let i = 10; i <= totalPages; i++) {
                    const pageUrl = `${baseUrl}/page${i}/${params}`;
                    const pageCount = await this.parsePage(pageUrl);
                    counter += pageCount;
                    progressBar(i, totalPages, `fetch ${this.name}`);
                }

                console.log('counter:', counter)
                resolve()
            } catch (e) {
                // console.log(e)
                reject(e);
            }
        });
    }

    async getDataCount(): Promise<number> {
        return KolradModel.count();
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(limit, offset): Promise<RimMap[]> {
        console.log('Start store Kolrad');

        const rawData: IKolrad.Raw[] = await KolradModel.findAll({limit, offset});
        const toCreate: RimMap[] = [];
        for (const item of rawData) {
            try {
                const {
                    vendor: brand,
                    picture: image,
                    vendorCode,
                } = item;

                const stock = this.getRimStocks(item);
                const price = this.getRimPrice(item);
                const params: IKolrad.ParsedParams = this.getRimParsedParams(item)

                toCreate.push({
                    uid: `${this.name}_${vendorCode}`,
                    supplier: this.name,
                    price,
                    brand,
                    image,
                    type: rimType.alloy,
                    stock: JSON.stringify(stock),
                    inStock: stock.reduce<number>((acc, {count}) => acc += count, 0),
                    ...params
                })
            } catch (e) {
                console.log(e)
            }
        }
        return toCreate
    }

    private async getTotalPages(url: string): Promise<number> {
        return new Promise((resolve) => {
            request.get(url)
                .on('response', resp => {
                    const xml = new XmlStream(resp);

                    xml.on('endElement: pages', page => {
                        resolve(Number(page['$text']))
                    })

                    xml.on('error', (err) => {
                        console.error(err)
                        throw new Error(err)
                    });
                })
        })
    }

    private async parsePage(url: string): Promise<number> {
        let pageCounter = 0;
        return new Promise((resolve) => {
            const functions = [];
            request.get(url)
                .on('response', resp => {
                    const xml = new XmlStream(resp);

                    xml.collect('param');
                    xml.on('endElement: offer', (item: any) => {
                        functions.push((async () => {
                            if (item.categoryId !== '5') {
                                return;
                            }

                            const stock = item.stocks?.stock
                            if (!stock || (stock['$']?.id !== '3' || stock.quantity === '0')) {
                                return;
                            }

                            try {
                                item.param = JSON.stringify(item.param);
                                item.prices = JSON.stringify(item.prices);
                                item.stocks = JSON.stringify(item.stocks);
                                await KolradModel.upsert(item)
                                pageCounter++;
                            } catch (e) {
                                console.error(e, item);
                            }
                        })())

                    });

                    xml.on("error", (err) => {
                        console.log('Error', err);
                    });

                    xml.on("end", async () => {
                        await Promise.all(functions);
                        resolve(pageCounter);
                    });
                });
        })
    }

    private getRimStocks({stocks}: IKolrad.Raw): RimStock[] {
        const parsedStocks: ParsedStocks = JSON.parse(stocks);
        let count = 0
        if (parsedStocks?.stock?.quantity) {
            count = parsedStocks.stock.quantity === '>12' ? 13 : Number(parsedStocks.stock.quantity);
        }

        return [{
            name: STOCK_MSK,
            shippingTime: '1-2',
            count: count
        }]
    }

    private getRimPrice({prices, vendorCode}: IKolrad.Raw): number {
        const errText = `ERROR: Item with vendor code ${vendorCode} must have price`

        if (!prices) {
            throw new Error(errText)
        }

        const parsedPrices = JSON.parse(prices)
        if (!parsedPrices.rrc) {
            throw new Error(errText)
        }
        return parsedPrices.rrc;
    }

    private getRimParsedParams({param, vendorCode}: IKolrad.Raw): IKolrad.ParsedParams {
        if (!param) {
            throw new Error(`ERROR: Item with vendor code ${vendorCode} must have params`);
        }
        const parsedParams: IKolrad.RawParam[] = JSON.parse(param);

        // if param exist change it on true
        // all params must be founded
        const mustHaveParams: { [K in keyof IKolrad.ParsedParams]: boolean } = {
            diameter: false,
            model: false,
            color: false,
            dia: false,
            et: false,
            width: false,
            bolts_count: false,
            bolts_spacing: false,
            pcd: false,
        }

        const formattedParams = new Proxy({}, {
            set(target, prop, value) {
                mustHaveParams[prop] = true
                target[prop] = value
                return true
            }
        })

        for (const param of parsedParams) {
            const rawParamName = param['$'].name;
            const paramName = IKolrad.RawParamNames[rawParamName];
            const paramValue = param['$text'];

            if (!rawParamName || !paramValue) {
                console.log(`ERROR: Can't parse param`, param);
                continue;
            }

            if (paramName === IKolrad.RawParamNames.PCD) {
                const [bolts_count, bolts_spacing] = paramValue.split('/');
                formattedParams['bolts_count'] = bolts_count;
                formattedParams['bolts_spacing'] = parseDouble(bolts_spacing);
                formattedParams['pcd'] = `${bolts_count}x${parseDouble(bolts_spacing)}`;
                continue;
            }

            if (paramName === IKolrad.RawParamNames["D (размер обода)"]) {
                formattedParams[paramName] = parseDouble(paramValue.split('x')[1]);
                continue;
            }

            if (paramName === IKolrad.RawParamNames.DIA) {
                formattedParams[paramName] = parseDouble(paramValue.split('d-')[1]);
                continue;
            }

            if (paramName === IKolrad.RawParamNames.ET) {
                formattedParams[paramName] = parseDouble(paramValue.split('ET')[1]);
                continue;
            }

            if (paramName === IKolrad.RawParamNames['LZ (ширина обода)']) {
                formattedParams[paramName] = parseDouble(paramValue);
                continue;
            }

            formattedParams[paramName] = paramValue;
        }

        if (Object.keys(mustHaveParams).includes('false')) {
            throw new Error(`ERROR: Item with vendor code ${vendorCode} must have all params`);
        }

        return <IKolrad.ParsedParams>formattedParams
    }

}

