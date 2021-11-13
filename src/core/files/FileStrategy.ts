import {fileStrategy} from 'config';
import {LocalStrategy} from "@core/files/LocalStrategy";
import {S3Strategy} from "@core/files/S3Strategy";

export interface CreateOptions {
    mimeType?: string;
    rewrite?: boolean;
}

export interface FileStrategy {
    create(file: Buffer, name: string, options?: CreateOptions): Promise<string>;

    delete(filePath: string): Promise<void>;
}

export class FileStrategyHelper {
    private static fs: FileStrategy;

    static getInstance(): FileStrategy {
        if (!this.fs) {
            switch (fileStrategy) {
                case 's3':
                    this.fs = new S3Strategy();
                    break;
                case 'local':
                default:
                    this.fs = new LocalStrategy();
            }
        }

        return this.fs;
    }
}
