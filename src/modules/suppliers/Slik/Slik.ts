import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import parseDouble from "../../../helpers/parseDouble";
import {RimMap, RimStock, STOCK_TOLYATTI, Supplier, SupplierRim} from "../types";
import Product from "@models/Product.model";
import SlikModel, {ISilkRaw} from "./Slik.model";
import {rimType} from "../ProductMapping";


export class Slik implements Supplier, SupplierRim {
    readonly name = 'slik'

    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Start fetch Slik');
            let counter = 0;
            try {
                const ftp = new FTP();

                ftp.on('ready', () => {
                    ftp.get(config.get('suppliers.Slik.ftp_file'), (err, stream) => {
                        const xml = new XmlStream(stream);
                        xml.on('endElement: gd', async (item: ISilkRaw) => {
                            counter++;
                            await SlikModel.upsert(item);
                        });

                        xml.on('end', () => {
                            ftp.end();
                            console.log(`End fetch Slik [${counter}]`);
                            resolve();
                        });
                    });
                });

                ftp.connect(config.get('suppliers.Slik.ftp'));
            } catch (e) {
                reject(e);
            }
        });
    }

    async getDataCount(): Promise<number> {
        return SlikModel.count();
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(): Promise<RimMap[]> {
        const rawData = await SlikModel.findAll();

        return rawData.map<RimMap>((item) => {
            const supplier = 'slik';

            const stock: RimStock[] = [
                {
                    name: STOCK_TOLYATTI,
                    shippingTime: '6-8',
                    count: item.count === '*' ? 20 : parseDouble(item.count) || 0
                }
            ];

            return {
                uid: `${this.name}_${item.code}`,
                supplier: this.name,
                model: item.model,
                brand: item.brand,
                image: encodeURI(item.image),
                price: parseDouble(item.price),
                pcd: `${item.bolts_count}X${item.bolts_spacing}`,
                width: parseDouble(item.width),
                color: item.color || null,
                diameter: parseDouble(item.diameter),
                bolts_count: parseDouble(item.bolts_count),
                bolts_spacing: parseDouble(item.bolts_spacing),
                et: parseDouble(item.et),
                type: rimType.alloy,
                dia: parseDouble(item.dia),
                color_name: item.color,
                stock: JSON.stringify(stock),
                inStock: stock.reduce<number>((acc, {count}) => acc += count, 0),
            };
        });
    }
}


