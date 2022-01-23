import program from 'commander';
import {Migrate} from "../migrations/service";
import {MStore} from "../migrations/service/store";

import {sequelizeTs} from "@core/database";
import {migrationSequelizeTs} from "../migrations/service/db";
import {loadSuppliersData, parseSuppliersData, updateSuppliersData} from "../modules/suppliers";
import {elasticProductService} from "@core/services";
import AttrValue from "@core/models/AttrValue.model";
import ProductVariant from "@core/models/ProductVariant.model";

program
    .command('es <action>')
    .description('Available actions: sync-data, reset-indexes')
    .action(async (action: 'sync-data' | 'reset-indexes') => {
        switch (action) {
            case 'sync-data':
                // TODO add realization
                // await elasticProductService.;
                process.exit(0);
                break;

            case 'reset-indexes':
                await elasticProductService.resetIndex();
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
        await updateSuppliersData();
        process.exit(0);
    });

program
    .command('load-suppliers-data')
    .description('Sync sequelize models')
    .action(async () => {
        await loadSuppliersData();
        process.exit(0);
    });

program
    .command('parse-suppliers-data')
    .description('Sync sequelize models')
    .action(async () => {
        await parseSuppliersData();
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
        console.log('env', process.env.NODE_ENV);
        const brand = 'REPLAY';
        const model = 'TY347';
        const query = await sequelizeTs.query(`
            SELECT C.product_id as id
            FROM ${AttrValue.tableName} A
                     LEFT JOIN ${AttrValue.tableName} B
                               ON A.product_variant_id = B.product_variant_id
                     LEFT JOIN ${ProductVariant.tableName} C
                               ON A.product_variant_id = C.id
            WHERE A.value = :brand
            AND B.value = :model 
            LIMIT 1
        `, {
            replacements: {
                brand,
                model,
            },
        });
        console.log('query', query);
        // @ts-ignore
        console.log('resp', query[0][0]?.id)
        process.exit(0);
    })


program.parse(process.argv);
