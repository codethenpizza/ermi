import {fileStrategy} from 'config';
import {LocalFilesService} from "@core/services/files/LocalFilesService";
import {S3FilesService} from "@core/services/files/S3FilesService";

export interface CreateOptions {
    mimeType?: string;
    rewrite?: boolean;
}

export interface FilesService {
    create(file: Buffer, name: string, options?: CreateOptions): Promise<string>;

    delete(filePath: string): Promise<void>;
}

export const getFilesService = (): FilesService => {
    switch (fileStrategy) {
        case 's3':
            return new S3FilesService();
        case 'local':
        default:
            return new LocalFilesService();
    }
}

