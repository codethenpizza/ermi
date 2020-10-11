import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import {Supplier, SupplierDisk} from "../types";
import Product from "@models/Product.model";
import SlikModel, {ISilkRaw} from "./Slik.model";
import {DiskMap} from "../ProductMapping";


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
                        await SlikModel.create(item);
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

