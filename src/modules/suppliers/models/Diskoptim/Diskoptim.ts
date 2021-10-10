import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import parseDouble from "../../../../helpers/parseDouble";

import {STOCK_MSK, STOCK_SPB, Supplier} from "../../types";
import {RimMap, RimStock, SupplierRim} from "../../helpers/rimProductType/rimTypes";
import Product from "@models/Product.model";
import DiskoptimModel, {DiskoptimRawRimMap} from "./Diskoptim.model"
import {rimType} from "../../helpers/constants";


export class Diskoptim implements Supplier, SupplierRim {
    readonly name = 'Diskoptim';

    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log('Start fetch Diskoptim');

            let counter = 0;
            let errCounter = 0;
            const functions = [];
            try {
                const ftp = new FTP();

                ftp.on('ready', () => {
                    ftp.get(config.get('suppliers.Diskoptim.ftp_file'), (err, stream) => {
                        const xml = new XmlStream(stream);
                        xml.on('endElement: Диск', (item) => {
                            functions.push((async () => {
                                const formattedItem = {};
                                try {
                                    for (const [key, value] of Object.entries(item)) {
                                        if (DiskoptimRawRimMap[key]) {
                                            formattedItem[DiskoptimRawRimMap[key]] = value
                                        } else {
                                            throw new Error(`undefined item key: ${key}`)
                                        }
                                    }
                                    await DiskoptimModel.upsert(formattedItem);
                                    counter++;
                                } catch (e) {
                                    console.error(e.message);
                                    errCounter++;
                                }
                            })());
                        });

                        xml.on('end', async () => {
                            ftp.end();
                            await Promise.all(functions);
                            console.log(`End fetch Diskoptim. Total: [${counter}] Errors: [${errCounter}]`);
                            resolve();
                        });
                    });
                });
                ftp.connect(config.get('suppliers.Diskoptim.ftp'));
            } catch (e) {
                reject(e);
            }
        });
    }

    async getDataCount(): Promise<number> {
        return DiskoptimModel.count();
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(limit, offset): Promise<RimMap[]> {
        console.log('Start store Diskoptim');

        const rawData = await DiskoptimModel.findAll({limit, offset});

        const toCreate = [];
        for (const item of rawData) { //parse raw rim and compare

            const [raw_bolts_count, raw_bolts_spacing] = item.PCD.split('x');

            const stock: RimStock[] = [
                {
                    name: STOCK_MSK,
                    shippingTime: '1-2',
                    count: parseDouble(item.countMSK) || 0
                },
                {
                    name: STOCK_SPB,
                    shippingTime: '4-5',
                    count: parseDouble(item.countSPB) || 0
                }
            ];

            const rim: DiskoptimRimMap = {
                uid: `${this.name}_${item.code}`,
                supplier: this.name,
                model: item.model,
                brand: item.brand,
                image: item.image && encodeURI(item.image),
                price: parseDouble(item.price),
                pcd: `${raw_bolts_count}X${parseDouble(raw_bolts_spacing)}`,
                width: parseDouble(item.width),
                color: item.color || null,
                diameter: parseDouble(item.diameter),
                bolts_count: parseDouble(raw_bolts_count),
                bolts_spacing: parseDouble(raw_bolts_spacing),
                et: parseDouble(item.et),
                type: rimType.alloy,
                dia: parseDouble(item.DIA),
                stock: JSON.stringify(stock),
                inStock: stock.reduce<number>((acc, {count}) => acc += count, 0),
            };

            toCreate.push(rim)
        }
        return toCreate;
    }
}

interface IDiskoptimCodeSlik {
    codeSlik?: string
}

interface DiskoptimRimMap extends RimMap, IDiskoptimCodeSlik {
}