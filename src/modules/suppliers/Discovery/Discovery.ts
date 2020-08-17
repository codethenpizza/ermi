import config from 'config';
import request from 'request';
import XmlStream from 'xml-stream';

import {Supplier} from "../../supplier";
import DiscoveryModel, {IDiscovery} from "./Discovery.model";
import Product from "@models/Product.model";


export class Discovery implements Supplier {
    private convertData(data: DiscoveryDisk): IDiscovery {
        return {
            code: data.code,
            artikul: data.artikul,
            name: data.name,
            brand: data.brand,
            picture: data.picture,
            model_name: data.model,
            price: parseDouble(data.price),
            price_recommended: parseDouble(data.price_recommended),
            rest_fast: parseDouble(data.rest_fast),
            color: data.param.find((item) => item.$.name === 'Цвет')?.$text ?? null,
            pcd: data.param.find((item) => item.$.name === 'H/PCD')?.$text ?? null,
            width: parseDouble(data.param.find((item) => item.$.name === 'Ширина обода')?.$text) ?? null,
            diameter: parseDouble(data.param.find((item) => item.$.name === 'Диаметр колеса')?.$text) ?? null,
            bolts_count: parseDouble(data.param.find((item) => item.$.name === 'Количество отверстий')?.$text) ?? null,
            bolts_spacing: parseDouble(data.param.find((item) => item.$.name === 'Диаметр расположения отверстий')?.$text) ?? null,
            et: parseDouble(data.param.find((item) => item.$.name === 'Вылет ET')?.$text) ?? null,
            type: data.param.find((item) => item.$.name === 'Тип диска')?.$text ?? null,
            dia: parseDouble(data.param.find((item) => item.$.name === 'Диаметр ступицы Dia')?.$text) ?? null,
            color_name: data.param.find((item) => item.$.name === 'Расшифровка цвета RUS')?.$text ?? null,
        };
    }

    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log('Start fetch Discovery');

            const host = config.get('suppliers.Discovery.api.host');
            const token = config.get('suppliers.Discovery.api.token');
            const url = `${host}?token=${token}`;

            let counter = 0;
            try {
                request.get(url)
                    .on('response', resp => {
                        const xml = new XmlStream(resp);

                        xml.collect('param');
                        xml.on('endElement: disk', async (item: DiscoveryDisk) => {
                            counter++;

                            console.log(item);

                            const data: IDiscovery = this.convertData(item);

                            await DiscoveryModel.create(data);

                        });

                        xml.on("error", (qwe) => console.log('Error', qwe));

                        xml.on("end", () => {
                            console.log(`End fetch Discovery [${counter}]`);
                            resolve();
                        });
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
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


interface DiscoveryDisk {
    code: string;
    artikul: string;
    name: string;
    brand: string;
    picture: string;
    model: string;
    price: string;
    price_recommended: string;
    rest_fast: string;
    rest_middle: string;
    param: { '$': { name: string }, '$text': string }[]
}