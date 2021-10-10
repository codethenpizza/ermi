import config from 'config';
import request from 'request';
import XmlStream from 'xml-stream';
import parseDouble from "../../../../helpers/parseDouble";

import {STOCK_MSK} from "../../types";
import {RimMap, RimStock, SupplierRim} from "../../helpers/rimProductType/rimTypes";
import DiscoveryModel, {IDiscoveryRaw} from "./Discovery.model";
import Product from "@models/Product.model";

export class Discovery implements SupplierRim {
    readonly name = 'discovery'

    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log('Start fetch Discovery');

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
                            console.log(`End fetch Discovery. Total: [${counter}] Errors: [${errCounter}]`);
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

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(limit, offset): Promise<RimMap[]> {
        console.log('Start store Discovery');

        const rawData = await DiscoveryModel.findAll({limit, offset});

        return rawData.map<RimMap>((item) => {
            const param = JSON.parse(item.param);

            if (!param) {
                return null;
            }

            const bolts_count = parseDouble(param.find((e) => e.$.name === 'Количество отверстий')?.$text) || null;
            const bolts_spacing = parseDouble(param.find((e) => e.$.name === 'Диаметр расположения отверстий')?.$text) || null;

            const supplier = 'discovery';

            const stock: RimStock[] = [
                {
                    name: STOCK_MSK,
                    shippingTime: '1-2',
                    count: item.rest_fast === '+' ? 20 : parseDouble(item.rest_fast) || 0
                }
            ];

            return {
                uid: `${this.name}_${item.code}`,
                supplier: this.name,
                model: item.model,
                brand: item.brand,
                image: item.picture && encodeURI(item.picture),
                price: parseDouble(item.price),
                pcd: `${bolts_count}X${bolts_spacing}`,
                width: parseDouble(param.find((e) => e.$.name === 'Ширина обода')?.$text),
                color: param.find((e) => e.$.name === 'Цвет')?.$text || null,
                diameter: parseDouble(param.find((e) => e.$.name === 'Диаметр колеса')?.$text),
                bolts_count,
                bolts_spacing,
                et: parseDouble(param.find((e) => e.$.name === 'Вылет ET')?.$text),
                type: param.find((e) => e.$.name === 'Тип диска')?.$text || null,
                dia: parseDouble(param.find((e) => e.$.name === 'Диаметр ступицы Dia')?.$text),
                color_name: param.find((e) => e.$.name === 'Расшифровка цвета RUS')?.$text || null,
                stock: JSON.stringify(stock),
                inStock: stock.reduce<number>((acc, {count}) => acc += count, 0),
            };
        }).filter(x => Boolean(x));
    }
}
