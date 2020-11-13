import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import parseDouble from "../../../helpers/parseDouble";
import {DiskMap, Supplier, SupplierDisk} from "../types";
import Product from "@models/Product.model";
import SlikModel, {ISilkRaw} from "./Slik.model";
import {diskType} from "../ProductMapping";


export class Slik implements Supplier, SupplierDisk {
    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Start fetch Slik');
            let counter = 0;
            try {
                const ftp = new FTP();
                ftp.connect(config.get('suppliers.Slik.ftp'));

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
            } catch (e) {
                reject(e);
            }
        });
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(): Promise<DiskMap[]> {
        const rawData = await SlikModel.findAll();

        return rawData.map<DiskMap>((item) => {
            const inStock = item.stock ? item.stock === '+' ? 20 : parseDouble(item.stock) : 0; //TODO use 20 as maximum?

            return {
                uid: 'slik_' + item.code,
                model: item.model,
                brand: item.brand,
                image: item.image,
                inStock,
                price: parseDouble(item.price),
                pcd: item.bolts_spacing2 ? parseDouble(item.stock) : null,
                width: item.width ? parseDouble(item.width) : null,
                color: item.color || null,
                diameter: item.diameter ? parseDouble(item.diameter) : null,
                bolts_count: item.bolts_count ? parseDouble(item.bolts_count) : null,
                bolts_spacing: item.bolts_spacing ? parseDouble(item.bolts_spacing) : null,
                et: item.et ? parseDouble(item.et) : null,
                type: diskType.alloy,
                dia: item.dia ? parseDouble(item.dia) : null,
                color_name: item.color,
            }
        });
    }
}


