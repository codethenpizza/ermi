// @ts-ignore
import program, {Command} from 'commander';
import {resetIndex} from "../src/server/elastic";
// @ts-ignore
import {Migrate} from "../migrations/service";
// @ts-ignore
import {MStore} from "../migrations/service/store";

import {sequelizeTs} from "../src/database";
// @ts-ignore
import {migrationSequelizeTs} from "../migrations/service/db";
import {parseSuppliers} from "../src/modules/suppliers";

program
    .command('es <action>')
    .description('Available actions: update-index')
    .action(async (action) => {
        switch (action) {
            case 'refresh-index':
                // await updateProductIndexes();
                process.exit(0);
                break;

            case 'reset-indexes':
                await resetIndex();
                process.exit(0);
                break;
            default:
                console.log('Command not found');
        }
    });

program
    .command('update-suppliers-data')
    .description('Sync sequelize models')
    .action(async () => {
        await parseSuppliers();
        process.exit(0);
    });

program
    .command('migrate [action] [attr]')
    .description('Migrations API')
    .action(async (action?: string, attr?: string) => {
        const store = new MStore();
        const migrate = new Migrate(store)

        try {
            if (action) {
                switch (action) {
                    case 'init':
                        await migrate.init();
                        break;

                    case 'create':
                        await migrate.create(attr);
                        break;

                    case 'up':
                        await migrate.up(attr);
                        break;

                    case 'down':
                        await migrate.down(attr);
                        break;

                    case 'sync':
                        await migrate.syncFiles();
                        break;
                }
            } else {
                await migrate.allUp();
            }

        } catch (e) {
            console.log(e);
        }
        process.exit(0);
    });

program
    .command('sync-models [force]')
    .description('Sync sequelize models')
    .action(async (force?: string) => {
        await sequelizeTs.sync({
            force: !!force,
            alter: !force
        });
        await migrationSequelizeTs.sync({
            force: !!force,
            alter: !force
        })
        process.exit(0);
    });

program
    .command('test')
    .action(async () => {
        // try {
        //
        //     const fileName = '52519.JPG';
        //     try {
        //         const file = await new Promise<Buffer>((resolve, reject) => {
        //             https.get(`https://discovery.moscow/dbpics/${fileName}`, res => {
        //                 if (res.statusCode === 200) {
        //                     bufferFromStream(res).then(x => resolve(x));
        //                 } else {
        //                     reject('Wrong url');
        //                 }
        //             });
        //         });
        //         console.log('file', file);
        //     } catch (e) {
        //         console.error('error: ', e);
        //     }
        //
        //
        //     const s3Strategy = new S3Strategy();
        //
        //     await s3Strategy.delete('https://img.four-wheels.ru/product/52519.jpeg');
        //     await s3Strategy.delete('https://img.four-wheels.ru/product/52519_1.jpeg');
        //     const resp = await s3Strategy.create(file, fileName);
        //
        //     console.log('isFileExist', resp);
        // } catch (e) {
        //     console.error(e);
        // }
        //
        // process.exit(0);
    })


program.parse(process.argv);
