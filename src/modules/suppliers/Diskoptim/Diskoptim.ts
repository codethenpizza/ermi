import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import parseDouble from "../../../helpers/parseDouble";

import {DiskMap, DiskStock, STOCK_MSK, STOCK_SPB, Supplier, SupplierDisk} from "../types";
import Product from "@models/Product.model";
import {diskType} from "../ProductMapping";
import DiskoptimModel, {DiskoptimRawDiskMap} from "./Diskoptim.model"


export class Diskoptim implements Supplier, SupplierDisk {
    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Start fetch Diskoptim');
            let counter = 0;
            try {
                const ftp = new FTP();

                ftp.on('ready', () => {
                    ftp.get(config.get('suppliers.Diskoptim.ftp_file'), (err, stream) => {
                        const xml = new XmlStream(stream);
                        xml.on('endElement: Диск', async (item) => {
                            counter++;
                            const formattedItem = {};
                            for (const [key, value] of Object.entries(item)) {
                                if (DiskoptimRawDiskMap[key]) {
                                    formattedItem[DiskoptimRawDiskMap[key]] = value
                                } else {
                                    throw new Error(`undefined item key: ${key}`)
                                }
                            }
                            await DiskoptimModel.upsert(formattedItem);
                        });

                        xml.on('end', () => {
                            ftp.end();
                            console.log(`End fetch Diskoptim [${counter}]`);
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

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(): Promise<DiskMap[]> {
        const rawData = await DiskoptimModel.findAll();

        const toCreate = [];
        for (const item of rawData) { //parse raw disk and compare

            const [raw_bolts_count, raw_bolts_spacing] = item.PCD.split('x');
            const supplier = 'diskoptim';

            const stock: DiskStock[] = [
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

            const disk: DiskoptimDiskMap = {
                uid: `${supplier}_${item.code}`,
                supplier,
                model: item.model,
                brand: item.brand,
                image: encodeURI(item.image),
                price: parseDouble(item.price),
                pcd: `${raw_bolts_count}X${raw_bolts_spacing}`,
                width: parseDouble(item.width),
                color: item.color || null,
                diameter: parseDouble(item.diameter),
                bolts_count: parseDouble(raw_bolts_count),
                bolts_spacing: parseDouble(raw_bolts_spacing),
                et: parseDouble(item.et),
                type: diskType.alloy,
                dia: parseDouble(item.DIA),
                stock: JSON.stringify(stock),
                inStock: stock.reduce<number>((acc, {count}) => acc += count, 0),
            };

            toCreate.push(disk)
        }
        return toCreate;
    }
}

interface IDiskoptimCodeSlik {
    codeSlik?: string
}

interface DiskoptimDiskMap extends DiskMap, IDiskoptimCodeSlik {
}
