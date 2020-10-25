import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import parseDouble from "../../../helpers/parseDouble";
import Sequelize, {Op} from "sequelize";

import {DiskMap, Supplier, SupplierDisk} from "../types";
import Product from "@models/Product.model";
import {diskType, ProductMapping} from "../ProductMapping";
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
                disk.codeSlik = item.codeSlik || null;
                toCompare.push(disk);
                continue;
            }
            toCreate.push(disk)
        }
        if (toCompare.length) {
            const filteredRims = await this.compareRimsSlik(toCompare);
            toCreate.push(...filteredRims)
        }

        return toCreate;
    }

    async compareRimsSlik(parsedRimsArr: DiskoptimDiskMap[]): Promise<DiskMap[]> { //item to be found
        console.log('start compare');
        const toCompareByCode = [];
        const toCompareByParams = [];
        const toCreate = []; //filtered item which will be created

        for (const parsedRim of parsedRimsArr) {
            if (parsedRim.codeSlik) {
                toCompareByCode.push(parsedRim);
            } else {
                toCompareByParams.push(parsedRim)
            }
        }

        console.log('total', parsedRimsArr.length);
        console.log('code', toCompareByCode.length);
        console.log('params', toCompareByParams.length);

        if (toCompareByCode.length) {
            let compareByCodeCount = 0;
            let lowestPriceByCode = 0;
            let uniqueByCode = 0;

            for (const parsedRim of toCompareByCode) {
                try {
                    const slikCode = 'slik_' + parsedRim.codeSlik;

                    const slikDiskArr = await ProductVariant.findAll({
                        where: {
                            vendor_code: slikCode,
                            price: Sequelize.where(
                                Sequelize.literal('price'),
                                '<',
                                parsedRim.price
                            )
                        }
                    });
                    if (slikDiskArr && slikDiskArr.length) {
                        compareByCodeCount++;
                        const priceArr = slikDiskArr.map(disk => disk.price);
                        const minPrice = Math.min(...priceArr);
                        if (parsedRim.price < minPrice) {
                            // console.log('compareRimsSlik: (params) lowest price!', parsedRim.uid);
                            lowestPriceByCode++;
                            toCreate.push(parsedRim)
                        }
                    }
                    if (slikDiskArr && !slikDiskArr.length) {
                        uniqueByCode++;
                        toCreate.push(parsedRim)
                    }
                } catch (e) {
                    console.log('compareRimsSlik error: compare by code. rim uid: ', parsedRim.uid)
                }
            }

            console.log('compareRimsSlik: (code) to compare price by code count', compareByCodeCount);
            console.log('compareRimsSlik: (code) lowest price count!', lowestPriceByCode);
            console.log('compareRimsSlik: (code) unique disk count', uniqueByCode)
        }

        if (toCompareByParams.length) {
            const productMapping = new ProductMapping;
            const mapping = await productMapping.getMapping();

            //dev
            let toCompareByPrice = 0;
            let lowestPriceCount = 0;
            let uniqueCount = 0;

            for (const parsedRim of toCompareByParams) {
                try {
                    const slikDiskArr = await ProductVariant.findAll({
                        where: {
                            vendor_code: {[Op.regexp]: `^slik`},
                        },
                        include: [
                            {
                                model: AttrValue, where: {
                                    id: mapping['dia'],
                                    value: parsedRim.dia
                                }
                            },
                            {
                                model: AttrValue, where: {
                                    id: mapping['et'],
                                    value: parsedRim.et
                                }
                            },
                            {
                                model: AttrValue, where: {
                                    id: mapping['width'],
                                    value: parsedRim.width
                                }
                            },
                            {
                                model: AttrValue, where: {
                                    id: mapping['bolts_count'],
                                    value: parsedRim.bolts_count
                                }
                            },
                            {
                                model: AttrValue, where: {
                                    id: mapping['bolts_spacing'],
                                    value: parsedRim.bolts_spacing
                                }
                            }
                        ]
                    });
                    if (slikDiskArr && slikDiskArr.length) {
                        toCompareByPrice++;
                        const priceArr = slikDiskArr.map(disk => disk.price);
                        const minPrice = Math.min(...priceArr);
                        if (parsedRim.price < minPrice) {
                            // console.log('compareRimsSlik: (params) lowest price!', parsedRim.uid);
                            lowestPriceCount++;
                            toCreate.push(parsedRim)
                        }
                    }
                    if (slikDiskArr && !slikDiskArr.length) {
                        // console.log('compareRimsSlik: (params) unique disk', parsedRim.uid);
                        uniqueCount++;
                        toCreate.push(parsedRim)
                    }
                } catch (e) {
                    console.error('compareRimsSlik error: compare by params. rim uid: ', parsedRim.uid)
                }
            }
            console.log('compareRimsSlik: (params) to compare price by params count', toCompareByPrice);
            console.log('compareRimsSlik: (params) lowest price count!', lowestPriceCount);
            console.log('compareRimsSlik: (params) unique disk count', uniqueCount);
        }
        console.log('End compare. Total to create', toCreate.length);
        return toCreate;
    }
}

interface IDiskoptimCodeSlik {
    codeSlik?: string
}

interface DiskoptimDiskMap extends DiskMap, IDiskoptimCodeSlik {
}
