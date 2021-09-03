// @ts-ignore
import program, {Command} from 'commander';
import {updateProductIndexes} from "../src/server/elastic";
// @ts-ignore
import {Migrate} from "../migrations/service";
// @ts-ignore
import {MStore} from "../migrations/service/store";
import {parseSuppliers} from "../src/server/crone";
import {sequelizeTs} from "../src/database";
import {migrationSequelizeTs} from "../migrations/service/db";

program
    .command('es <action>')
    .description('Available actions: update-index')
    .action(async (action) => {
        switch (action) {
            case 'update-index':
                await updateProductIndexes();
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
        await updateProductIndexes();
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

program.parse(process.argv);
