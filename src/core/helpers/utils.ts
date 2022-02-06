import fetch from 'node-fetch-commonjs';
import slugify from "slugify";
import {IAttrValue} from "@core/models/AttrValue.model";

export const bufferFromStream = (stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<Buffer> =>
    new Promise(resolve => {
        const chunks = [];
        stream
            .on('data', (data) => chunks.push(data))
            .on('end', () => resolve(Buffer.concat(chunks)));
    });


export const splitImageNameByExt = (str: string): { ext: string, name: string } => {
    const ext = str.split('.').pop();
    const name = str.split(new RegExp(`.${ext}$`)).shift();

    return {ext, name};
}

export const getFileNameFromUrl = (url: string): string => url.split('/').pop();

export const getImageFromUrl = (url: string): Promise<Buffer> => fetch(url).then(x => x.buffer());

export const isDev = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

export const customStringify = (className: string) => slugify(className, {lower: true});

export const getAttrValuesHash = (attrValues: Pick<IAttrValue, 'attr_id' | 'value'>[]): number =>
    getHash(
        attrValues
            .sort((a, b) => a.attr_id - b.attr_id)
            .map(x => x.value)
            .join('')
    );

export const getHash = (str: string): number => {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export const generateVariantCode = (length = 15) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};

export const commonSlugify = (str: string): string => slugify(str, {lower: true})
