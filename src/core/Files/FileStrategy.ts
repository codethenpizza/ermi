import {fileStrategy} from 'config';
import {LocalStrategy} from "@core/Files/LocalStrategy";

export interface FileStrategy {
    create(file: Buffer, name: string): Promise<string>;
    delete(filePath: string): Promise<void>;
}

export const getFileStrategy = (): FileStrategy => {
    switch (fileStrategy) {
        // case 's3':
        //     return new S3Strategy(); TODO
        //     break;
        case 'local':
        default:
            return new LocalStrategy();
    }
};
