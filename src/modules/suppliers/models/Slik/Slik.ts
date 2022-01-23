import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import {RimMap, Stock, SupplierRim} from "../../productTypes/rim/rimTypes";
import SlikModel, {ISilkRaw} from "./Slik.model";
import {ParsedData} from "../../types";
import {Supplier} from "../../interfaces/Supplier";
import {STOCK_TOLYATTI} from "../../constants";
import parseDouble from "@core/helpers/parseDouble";
import {rimType} from "../../productTypes/rim/constants";


export class Slik extends Supplier implements SupplierRim {

    readonly name = 'Slik'

    async loadData(): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log(`Start fetch ${this.name}`);

            let counter = 0;
            let errCounter = 0;
            try {
                const ftp = new FTP();
                const functions = [];

                ftp.on('ready', () => {
                    ftp.get(config.get('suppliers.Slik.ftp_file'), (err, stream) => {
                        const xml = new XmlStream(stream);
                        xml.on('endElement: gd', (item: ISilkRaw) => {
                            functions.push((async () => {
                                counter++;
                                try {
                                    await SlikModel.upsert(item);
                                } catch (e) {
                                    console.error(e.message);
                                    errCounter++;
                                }
                            })())
                        });

                        xml.on('end', async () => {
                            ftp.end();
                            await Promise.all(functions);
                            console.log(`End fetch ${this.name}. Total: [${counter}] Errors: [${errCounter}]`);
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

    async getRims(limit, offset): Promise<ParsedData<RimMap>[]> {
        const rawData = await SlikModel.findAll({
            limit,
            offset
        });

        const parsedData: ParsedData<RimMap>[] = [];

        const vendorID = await this.getVendorId();

        for (const item of rawData) {

            const stock: Stock[] = [
                {
                    name: STOCK_TOLYATTI,
                    shippingTime: {
                        from: 6,
                        to: 8
                    },
                    count: item.count === '*' ? 20 : parseDouble(item.count) || 0
                }
            ];

            const inStockQty = stock.reduce<number>((acc, {count}) => acc += count, 0);

            const productAttrs: RimMap = {
                model: item.model,
                brand: item.brand,
                pcd: `${item.bolts_count}X${parseDouble(item.bolts_spacing)}`,
                width: parseDouble(item.width),
                color: item.color || null,
                diameter: parseDouble(item.diameter),
                bolts_count: parseDouble(item.bolts_count),
                bolts_spacing: parseDouble(item.bolts_spacing),
                et: parseDouble(item.et),
                type: rimType.alloy,
                dia: parseDouble(item.dia),
                countryOfOrigin: item.cnt_mnf
            };

            const itemData: ParsedData<RimMap> = {
                offerData: {
                    price: parseDouble(item.price),
                    imageUrls: item.image ? [encodeURI(item.image)] : [],
                    is_available: inStockQty > 0,
                    vendor_code: item.code,
                    vendor_id: vendorID,
                    in_stock_qty: inStockQty,
                    stock: JSON.stringify(stock),
                },
                attrValuesMap: productAttrs,
                productData: {
                    name: `${item.brand} ${item.model}`,
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


