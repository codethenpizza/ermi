import XmlStream from 'xml-stream';
import axios from "axios";
import {Supplier} from "../../interfaces/Supplier";
import {SupplierTire, TireMap} from "../../productTypes/tire/tireTypes";
import ShinserviceModel from "./Shinservice.model";
import {ParsedData} from "../../types";
import {Readable} from 'stream'
import config from 'config';
import {Stock} from "../../productTypes/rim/rimTypes";
import parseDouble from "@core/helpers/parseDouble";
import {STOCK_MSK} from "../../constants";

export class Shinservice extends Supplier implements SupplierTire {

    readonly name = 'Shinservice'

    private async getTiresXMLStream(): Promise<Readable> {
        const host = config.get('suppliers.Shinservice.api.host')
        const {data} = await axios.get(host)
        return Readable.from([data])
    }

    async loadData(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            console.log(`Start fetch ${this.name}`);

            let counter = 0;
            let errCounter = 0;
            const functions = [];
            try {
                const stream = await this.getTiresXMLStream()
                const xml = new XmlStream(stream);
                xml.on('endElement: tire', (item) => {
                    functions.push((async () => {
                        try {
                            if (!item['$']) {
                                throw new Error(`unable to get tire from item \n ${JSON.stringify(item)}`)
                            }
                            await ShinserviceModel.upsert(item['$'])
                            counter++;
                        } catch (e) {
                            console.error(e.message);
                            errCounter++;
                        }
                    })());
                });
                xml.on('end', async () => {
                    await Promise.all(functions);
                    console.log(`End fetch ${this.name}. Total: [${counter}] Errors: [${errCounter}]`);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }

        })
    }

    async getDataCount(): Promise<number> {
        return ShinserviceModel.count();
    }

    async getTires(limit: number, offset: number): Promise<ParsedData<TireMap>[]> {
        const rawData = await ShinserviceModel.findAll({limit, offset});
        const parsedData: ParsedData<TireMap>[] = [];
        const vendorID = await this.getVendorId();

        for (const item of rawData) {

            const {model, brand, width, profile, season, diam: diameter} = item
            const productAttrs: TireMap = {
                width: parseDouble(width),
                profile: parseDouble(profile),
                diameter,
                model,
                brand,
                season

            };

            const stock: Stock[] = [
                {
                    name: STOCK_MSK,
                    shippingTime: {
                        from: 1,
                        to: 2
                    },
                    count: +item.stock || 0
                }
            ];

            const inStockQty = +item.stock
            const itemData: ParsedData<TireMap> = {
                offerData: {
                    price: parseDouble(item.price),
                    imageUrls: item.photo ? [encodeURI(item.photo)] : [],
                    is_available: inStockQty > 0,
                    vendor_code: item.id,
                    vendor_id: vendorID,
                    in_stock_qty: inStockQty,
                    stock: JSON.stringify(stock),
                },
                attrValuesMap: productAttrs,
                productData: {
                    name: item.title,
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
