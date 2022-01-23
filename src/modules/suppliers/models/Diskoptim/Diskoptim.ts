import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import {RimMap, Stock, SupplierRim} from "../../productTypes/rim/rimTypes";
import DiskoptimModel, {DiskoptimRawRimMap} from "./Diskoptim.model"
import {ParsedData} from "../../types";
import {Supplier} from "../../interfaces/Supplier";
import {STOCK_MSK, STOCK_SPB} from "../../constants";
import parseDouble from "@core/helpers/parseDouble";
import {rimType} from "../../productTypes/rim/constants";


export class Diskoptim extends Supplier implements SupplierRim {

    readonly name = 'Diskoptim';

    async loadData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log(`Start fetch ${this.name}`);

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
                            console.log(`End fetch ${this.name}. Total: [${counter}] Errors: [${errCounter}]`);
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

    async getRims(limit, offset): Promise<ParsedData<RimMap>[]> {
        const rawData = await DiskoptimModel.findAll({limit, offset});

        const parsedData: ParsedData<RimMap>[] = [];

        const vendorID = await this.getVendorId();

        for (const item of rawData) {

            const [raw_bolts_count, raw_bolts_spacing] = item.PCD.split('x');

            const stock: Stock[] = [
                {
                    name: STOCK_MSK,
                    shippingTime: {
                        from: 1,
                        to: 2
                    },
                    count: parseDouble(item.countMSK) || 0
                },
                {
                    name: STOCK_SPB,
                    shippingTime: {
                        from: 4,
                        to: 5
                    },
                    count: parseDouble(item.countSPB) || 0
                }
            ];

            const inStockQty = stock.reduce<number>((acc, {count}) => acc += count, 0);

            const productAttrs: RimMap = {
                model: item.model,
                brand: item.brand,
                pcd: `${raw_bolts_count}X${parseDouble(raw_bolts_spacing)}`,
                width: parseDouble(item.width),
                color: item.color || null,
                diameter: parseDouble(item.diameter),
                bolts_count: parseDouble(raw_bolts_count),
                bolts_spacing: parseDouble(raw_bolts_spacing),
                et: parseDouble(item.et),
                type: rimType.alloy,
                dia: parseDouble(item.DIA),
            };


            const itemData: ParsedData<RimMap> = {
                offerData: {
                    price: parseDouble(item.price),
                    imageUrls: [item.image && encodeURI(item.image)],
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
