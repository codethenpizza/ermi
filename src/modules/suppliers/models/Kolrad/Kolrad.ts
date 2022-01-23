import config from 'config';
import request from 'request';
import XmlStream from 'xml-stream';

import {STOCK_MSK} from "../../constants";
import {RimMap, Stock, SupplierRim} from "../../productTypes/rim/rimTypes";
import KolradModel, {IKolrad} from "./Kolrad.model";
import progressBar from "../../../../core/helpers/progressBar";
import parseDouble from "../../../../core/helpers/parseDouble";
import {ParsedData} from "../../types";
import {Supplier} from "../../interfaces/Supplier";
import {rimType} from "../../productTypes/rim/constants";

export class Kolrad extends Supplier implements SupplierRim {

    readonly name = 'Kolrad';

    readonly targetStockID = '3'; // "Скл Видное"

    async loadData(): Promise<void> {
        const {host, token, contractNum} = config.get('suppliers.Kolrad.api');
        const baseUrl = `${host}`;
        const params = `${contractNum}/?token=${token}`
        const url = `${baseUrl}/page0/${params}`

        return new Promise(async (resolve, reject) => {

            console.log(`Start fetch ${this.name}`);

            let counter = 0;
            let errCounter = 0;
            let totalPages = 0;

            try {
                totalPages = await this.getTotalPages(url);

                if (!totalPages) {
                    throw new Error('total pages is empty ' + totalPages);
                }

                const offset = 10;

                const chunkLength = 10;

                const total = totalPages - offset;

                const parseChunk = async (i: number) => {
                    const chuckFns = new Array(chunkLength).fill(null).map(async (_, index) => {
                        try {
                            const pageUrl = `${baseUrl}/page${i + index}/${params}`;
                            const pageCounters = await this.parsePage(pageUrl);
                            counter += pageCounters.counter;
                            errCounter += pageCounters.errCounter;
                        } catch (e) {
                            console.log('Chunk error', e);
                        }
                    });
                    await Promise.allSettled(chuckFns);


                    let current = i - offset + chunkLength;
                    if (current > total) {
                        current = total;
                    }
                    progressBar(current, total, `Page ${current}/${total}`);
                }


                progressBar(0, total, `Page ${0}/${total}`);
                for (let i = offset; i <= totalPages; i += chunkLength) {
                    await parseChunk(i);
                }

                console.log(`End fetch ${this.name}. Total: [${counter}] Errors: [${errCounter}]`);
                resolve();
            } catch (e) {
                console.log(e)
                reject(e);
            }
        });
    }

    async getDataCount(): Promise<number> {
        return KolradModel.count();
    }

    async getRims(limit, offset): Promise<ParsedData<RimMap>[]> {
        const rawData: IKolrad.Raw[] = await KolradModel.findAll({limit, offset});
        const parsedData: ParsedData<RimMap>[] = [];

        const vendorID = await this.getVendorId();

        for (const item of rawData) {
            try {
                const price = this.getRimPrice(item);
                const stock = this.getRimStocks(item);
                const inStockQty = stock.reduce<number>((acc, {count}) => acc += count, 0);

                const params: IKolrad.ParsedParams = this.getRimParsedParams(item);


                const productAttrs: RimMap = {
                    brand: item.vendor,
                    type: rimType.alloy,
                    dia: params.dia,
                    et: params.et,
                    pcd: params.pcd,
                    bolts_spacing: params.bolts_spacing,
                    color: params.color,
                    bolts_count: params.bolts_count,
                    width: params.width,
                    model: params.model,
                    diameter: params.diameter
                }

                const itemData: ParsedData<RimMap> = {
                    offerData: {
                        price,
                        imageUrls: item.picture ? [item.picture] : [],
                        is_available: inStockQty > 0,
                        vendor_code: item.vendorCode,
                        vendor_id: vendorID,
                        in_stock_qty: inStockQty,
                        stock: JSON.stringify(stock),
                    },
                    attrValuesMap: productAttrs,
                    productData: {
                        name: item.name,
                        cat_ids: [],
                        productVariant: {
                            images: [],
                            attrs: [], // will be mapped later
                            is_available: true,
                        }
                    }
                };

                parsedData.push(itemData);

            } catch (e) {
                console.error(e);
            }
        }

        return parsedData;
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

    private async parsePage(url: string): Promise<{ counter: number, errCounter: number }> {
        let counter = 0;
        let errCounter = 0;
        return new Promise((resolve) => {
            const functions = [];
            request.get(url)
                .on('response', resp => {
                    const xml = new XmlStream(resp);

                    xml.collect('param');
                    xml.collect('stock');

                    xml.on('endElement: offer', (item: any) => {
                        functions.push((async () => {
                            if (item.categoryId !== '5') {
                                return;
                            }

                            const stocks: IKolrad.ParsedStock[] = item.stocks?.stock;

                            const targetStock = stocks ? stocks.find(x => {
                                return x.$.id === this.targetStockID && x.quantity !== '0';
                            }) : null;

                            if (!targetStock) {
                                return;
                            }

                            try {
                                item.param = JSON.stringify(item.param);
                                item.prices = JSON.stringify(item.prices);
                                item.stocks = JSON.stringify(stocks);
                                await KolradModel.upsert(item)
                                counter++;
                            } catch (e) {
                                errCounter++;
                                console.error(e, item);
                            }
                        })())

                    });

                    xml.on("error", (err: Error) => {
                        if (err.message.includes('not well-formed')) {
                            return;
                        }
                        errCounter++;
                        console.error(err);
                    });

                    xml.on("end", async () => {
                        await Promise.all(functions);
                        resolve({counter, errCounter});
                    });
                });
        })
    }

    private getRimStocks({stocks}: IKolrad.Raw): Stock[] {
        const parsedStocks: IKolrad.ParsedStock[] = JSON.parse(stocks);
        let count = 0;

        const targetStock = parsedStocks.find(x => x.$.id === this.targetStockID);

        if (targetStock?.quantity) {
            count = targetStock.quantity === '>12' ? 13 : Number(targetStock.quantity);
        }

        return [{
            name: STOCK_MSK,
            shippingTime: {
                from: 1,
                to: 2
            },
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


