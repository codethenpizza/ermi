import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import parseDouble from "../../../helpers/parseDouble";
import Sequelize from "sequelize";

import {Supplier, SupplierDisk} from "../types";
import Product from "@models/Product.model";
import {DiskMap, diskType} from "../ProductMapping";
import DiskoptimModel, {DiskoptimRawDiskMap} from "./Diskoptim.model"
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";

export class Diskoptim implements Supplier, SupplierDisk {
    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Start fetch Diskoptim');
            let counter = 0;
            try {
                const ftp = new FTP();
                ftp.connect(config.get('suppliers.Diskoptim.ftp'));

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
                        console.log(`End fetch Slik [${counter}]`);
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

    async getRims(): Promise<DiskMap[]> {
        const rawData = await DiskoptimModel.findAll();

        const diskBrandToCompare = ['replay'];
        const toCompare = [];
        const toCreate = [];
        for (const item of rawData) { //parse raw disk and compare
            // console.log('rawDisk', item);
            const [raw_bolts_count, raw_bolts_spacing] = item.PCD.split('x');

            const disk: DiskoptimDiskMap = {
                uid: 'diskoptim_' + item.code,
                model_name: item.model,
                brand: item.brand,
                image: item.image,
                price: parseDouble(item.price),
                pcd: item.PCD ? parseDouble(item.PCD) : 0,
                inStock: item.countMSK ? parseDouble(item.countMSK) : 0,
                width: item.width ? parseDouble(item.width) : null,
                color: item.color || null,
                diameter: item.diameter ? parseDouble(item.diameter) : null,
                bolts_count: raw_bolts_count ? parseDouble(raw_bolts_count) : null,
                bolts_spacing: raw_bolts_spacing ? parseDouble(raw_bolts_spacing) : null,
                et: item.et ? parseDouble(item.et) : null,
                type: diskType.alloy,
                dia: item.DIA ? parseDouble(item.DIA) : null,
            };

            const compareBrand = item.brand.toString().toLowerCase();
            const isDiskForCompare = item.brand && diskBrandToCompare.includes(compareBrand);
            if (isDiskForCompare) {
                console.log('compare this disk');
                disk.codeSlik = item.codeSlik || null;
                toCompare.push(disk);
                continue;
            }
            toCreate.push(disk)
        }
        if (toCompare.length) {
            console.log(toCompare.length);
            for (const item of toCompare) {
                const isDiskInPriority = await this.compareRimsSlik(item);
                if (isDiskInPriority) {
                    console.log('is priority', item.uid);
                }
            }
        }

        return undefined;
    }

    async compareRimsSlik(parsedRim): Promise<Boolean> { //item to be found
        try {
            if (parsedRim.codeSlik) {
                // console.log('search by code', parsedRim.codeSlik);
                const slikCode = 'slik_' + parsedRim.codeSlik;

                const slikDisk = await ProductVariant.findAll({
                    where: {
                        vendor_code: slikCode,
                        price: Sequelize.where(
                            Sequelize.literal('price'),
                            '<',
                            parsedRim.price
                        )
                    }
                });
                // console.log('found: ', slikDisk);
                // console.log('is in priority', !!(slikDisk && !slikDisk.length));
                return !!(slikDisk && !slikDisk.length);
            } else {
                //find by params
                // console.log('skip', parsedRim.uid);
                const slikDisk = await ProductVariant.findAll({
                    where: {
                        'attrs.color': 'GMFP'
                    },
                    include: [{model: AttrValue, as: AttrValue.tableName}]
                });
                console.log('found: ', slikDisk);
                return false;
            }
        } catch (e) {
            console.error('compare diskoptim error:', e)
        }
    }
}

interface IDiskoptimCodeSlik {
    codeSlik?: string
}

interface DiskoptimDiskMap extends DiskMap, IDiskoptimCodeSlik {
}
