import config from 'config';
import request from 'request';
import XmlStream from 'xml-stream';
import parseDouble from "@core/helpers/parseDouble";

import DiscoveryModel, {IDiscoveryRaw} from "./Discovery.model";
import {RimMap, Stock, SupplierRim} from "../../productTypes/rim/rimTypes";
import {Supplier} from "../../interfaces/Supplier";
import {STOCK_MSK} from "../../constants";
import {ParsedData} from "../../types";

export class Discovery extends Supplier implements SupplierRim {

    readonly name = 'Discovery'

    async loadData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log(`Start fetch ${this.name}`);

            const {host, token} = config.get('suppliers.Discovery.api');
            const url = `${host}?token=${token}`;

            let counter = 0;
            let errCounter = 0;
            const functions = [];
            try {
                request.get(url)
                    .on('response', async resp => {
                        const xml = new XmlStream(resp);

                        xml.collect('param');
                        xml.on('endElement: disk', (item: IDiscoveryRaw) => {
                            functions.push((async () => {
                                try {
                                    item.param = JSON.stringify(item.param);
                                    await DiscoveryModel.upsert(item);
                                    counter++;
                                } catch (e) {
                                    console.error(e, item);
                                    errCounter++;
                                }
                            })());
                        });

                        xml.on("error", (err) => console.log('Error', err));

                        xml.on("end", async () => {
                            await Promise.all(functions);
                            console.log(`End fetch ${this.name}. Total: [${counter}] Errors: [${errCounter}]`);
                            resolve();
                        });
                    });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    async getDataCount(): Promise<number> {
        return DiscoveryModel.count();
    }

    async getRims(limit, offset): Promise<ParsedData<RimMap>[]> {
        const rawData = await DiscoveryModel.findAll({limit, offset});

        const parsedData: ParsedData<RimMap>[] = [];

        const vendorID = await this.getVendorId();

        for (const item of rawData) {
            const param = JSON.parse(item.param);

            if (!param) {
                continue;
            }

            const bolts_count = parseDouble(param.find((e) => e.$.name === 'Количество отверстий')?.$text) || null;
            const bolts_spacing = parseDouble(param.find((e) => e.$.name === 'Диаметр расположения отверстий')?.$text) || null;

            const beadlock = item.artikul?.match(/-BDL$/) ? true : undefined;

            const productAttrs: RimMap = {
                model: item.model,
                brand: item.brand,
                pcd: `${bolts_count}X${bolts_spacing}`,
                width: parseDouble(param.find((e) => e.$.name === 'Ширина обода')?.$text),
                color: param.find((e) => e.$.name === 'Цвет')?.$text || null,
                diameter: parseDouble(param.find((e) => e.$.name === 'Диаметр колеса')?.$text),
                bolts_count,
                bolts_spacing,
                et: parseDouble(param.find((e) => e.$.name === 'Вылет ET')?.$text),
                type: param.find((e) => e.$.name === 'Тип диска')?.$text || null,
                dia: parseDouble(param.find((e) => e.$.name === 'Диаметр ступицы Dia')?.$text),
                beadlock
            };

            const stock: Stock[] = [
                {
                    name: STOCK_MSK,
                    shippingTime: {
                        from: 1,
                        to: 2
                    },
                    count: item.rest_fast === '+' ? 20 : parseDouble(item.rest_fast) || 0
                }
            ];

            const inStockQty = stock.reduce<number>((acc, {count}) => acc += count, 0);

            const itemData: ParsedData<RimMap> = {
                offerData: {
                    price: parseDouble(item.price),
                    imageUrls: item.picture ? [encodeURI(item.picture)] : [],
                    is_available: inStockQty > 0,
                    vendor_code: item.code,
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
        }

        return parsedData;
    }
}
