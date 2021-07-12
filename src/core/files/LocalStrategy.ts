import {FileStrategy} from "@core/files/FileStrategy";
import fs from 'fs';
import {app} from 'config';

const UPLOAD_DIR = 'public/uploads';

export class LocalStrategy implements FileStrategy {

    async create(file: Buffer, name: string): Promise<string> {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, {recursive: true});
        }

        const fileUri = `${UPLOAD_DIR}/${name}`;
        fs.writeFileSync(`./${fileUri}`, file);
        return `${app.protocol}://${app.host}${app.port ? ':' + app.port : ''}/${fileUri}`;
    }

    async delete(filePath: string): Promise<void> {
        if (filePath) {
            const fileName = filePath.match(UPLOAD_DIR) && filePath.split(UPLOAD_DIR + '/').pop();
            if (fileName) {
                try {
                    fs.unlinkSync(`${UPLOAD_DIR}/${fileName}`);
                } catch (e) {
                    console.log('Delete file ERROR: ', e);
                }
            }
        }
    }

}
