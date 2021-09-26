import {fileStrategy} from 'config';
import {LocalStrategy} from "@core/files/LocalStrategy";
import {S3Strategy} from "@core/files/S3Strategy";

export interface FileStrategy {
    create(file: Buffer, name: string, mimeType?: string): Promise<string>;

    delete(filePath: string): Promise<void>;
}

export const getFileStrategy = (): FileStrategy => {
    switch (fileStrategy) {
        case 's3':
            return new S3Strategy();
        case 'local':
        default:
            return new LocalStrategy();
    }
};
