import config from 'config';
import request from 'request';
import XmlStream from 'xml-stream';

import {SupplierDisk} from "../types";
import DiscoveryModel, {IDiscoveryRaw} from "./Discovery.model";
import Product from "@models/Product.model";
import {DiskMap} from "../ProductMapping";

export class Discovery implements SupplierDisk {
    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log('Start fetch Discovery');

            const {host, token} = config.get('suppliers.Discovery.api');
            const url = `${host}?token=${token}`;

            let counter = 0;
            try {
                request.get(url)
                    .on('response', resp => {
                        const xml = new XmlStream(resp);

                        xml.collect('param');
                        xml.on('endElement: disk', async (item: IDiscoveryRaw) => {
                            counter++;

                            item.param = JSON.stringify(item.param);
                            try {
                                await DiscoveryModel.upsert(item);
                            } catch (e) {
                                console.error(e, item);
                            }
                        });

                        xml.on("error", (err) => console.log('Error', err));

                        xml.on("end", () => {
                            console.log(`End fetch Discovery [${counter}]`);
                            resolve();
                        });
                    });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(): Promise<DiskMap[]> {
        console.log('Start store Discovery');

        const rawData = await DiscoveryModel.findAll();

        return rawData.map<DiskMap>((item) => {
            const param = JSON.parse(item.param);

            return {
                uid: 'discovery_' + item.code,
                model_name: item.name,
                brand: item.brand,
                image: item.picture,
                price: parseDouble(item.price),
                priceMRC: parseDouble(item.price_recommended),
                pcd: parseDouble(param.find((e) => e.$.name === 'H/PCD')?.$text || null),
                inStock: parseDouble(item.rest_fast),
                width: parseDouble(param.find((e) => e.$.name === 'Ширина обода')?.$text) || null,
                color: param.find((e) => e.$.name === 'Цвет')?.$text || null,
                diameter: parseDouble(param.find((e) => e.$.name === 'Диаметр колеса')?.$text) || null,
                bolts_count: parseDouble(param.find((e) => e.$.name === 'Количество отверстий')?.$text) || null,
                bolts_spacing: parseDouble(param.find((e) => e.$.name === 'Диаметр расположения отверстий')?.$text) || null,
                et: parseDouble(param.find((e) => e.$.name === 'Вылет ET')?.$text) || null,
                type: param.find((e) => e.$.name === 'Тип диска')?.$text || null,
                dia: parseDouble(param.find((e) => e.$.name === 'Диаметр ступицы Dia')?.$text) || null,
                color_name: param.find((e) => e.$.name === 'Расшифровка цвета RUS')?.$text || null,
            }
        });
    }
}


export const parseDouble = (val: string): number => {
    if (!val) return null;
    const value = parseFloat(val.replace(',', '.'));
    if (!isNaN(value)) {
        return value;
    } else {
        return null;
    }
};
