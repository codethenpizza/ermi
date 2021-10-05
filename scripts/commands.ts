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
        // const {credentials, images: {region, Bucket, productDir}} = config.AWS;
        //
        // const s3Client = new S3Client({
        //     region,
        //     credentials
        // });
        //
        // let Marker = undefined;
        //
        // const reg = /.+_1.+/;
        // let i = 0;
        //
        // while (true) {
        //     const resp = await s3Client.send(new ListObjectsCommand({
        //         Bucket,
        //         Marker
        //     }));
        //
        //     if (!resp.Contents) {
        //         break;
        //     }
        //
        //     for (const {Key} of resp.Contents) {
        //         Marker = Key;
        //         if (reg.test(Key)) {
        //             await s3Client.send(new DeleteObjectCommand({
        //                 Bucket,
        //                 Key
        //             }))
        //         }
        //     }
        //
        //     console.log('i = ' + i++);
        //
        // }
        //
        // process.exit(0);
    })


program.parse(process.argv);
