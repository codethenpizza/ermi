import {CreateOptions, FileStrategy} from "@core/files/FileStrategy";
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import config from 'config';
import {splitImageNameByExt} from "../../helpers/utils";

export class S3Strategy implements FileStrategy {

    private readonly s3Client: S3Client;

    private readonly Bucket: string;

    private readonly productDir: string;

    constructor() {
        const {credentials, images: {region, Bucket, productDir}} = config.AWS;

        this.Bucket = Bucket;
        this.productDir = productDir;

        this.s3Client = new S3Client({
            region,
            credentials
        });
    }

    private static formatName(name: string): string {
        return name.replace(/\.JPG$/, '.jpeg');
    }

    private static getContentType(name: string): string {
        const type = name.split('.').pop() || 'jpeg';
        return `image/${type}`;
    }

    async create(Body: Buffer, name: string, {mimeType, rewrite}: CreateOptions = {}): Promise<string> {
        name = S3Strategy.formatName(name);

        const ContentType = mimeType || S3Strategy.getContentType(name);
        const dir = this.productDir ? `${this.productDir}/` : '';
        const Key = rewrite ? `${dir}${name}` : await this.getUniName(`${dir}${name}`);

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.Bucket,
            Key,
            Body,
            ContentType
        }));

        return `https://${this.Bucket}/${Key}`;
    }

    async delete(filePath: string): Promise<void> {

        const name = filePath.split('/').pop();
        const dir = this.productDir ? `${this.productDir}/` : '';
        const Key = `${dir}${name}`;

        await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.Bucket,
            Key
        }));
    }

    async isFileExist(Key: string): Promise<boolean> {
        try {
            await this.s3Client.send(new GetObjectCommand({
                Bucket: this.Bucket,
                Key
            }));
        } catch (e) {
            return false;
        }

        return true;
    }

    private async getUniName(Key: string): Promise<string> {
        const {name, ext} = splitImageNameByExt(Key);
        let tmpKey = Key;
        let i = 0;
        while (await this.isFileExist(tmpKey)) {
            i++;
            tmpKey = `${name}_${i}.${ext}`;
        }

        return tmpKey;
    }
}
