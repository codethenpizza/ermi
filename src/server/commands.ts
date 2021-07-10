import program, {Command} from 'commander';
import {updateProductIndexes} from "./elastic";
import {Migrate} from "../../migrations/service";
import {MStore} from "../../migrations/service/store";
import {sequelizeTs} from "@db";

// TODO move js to root/scripts

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
    .command('sync-models')
    .option('-f, --force', 'force')
    .description('Sync sequelize models')
    .action(async (command) => {
        await sequelizeTs.sync({
            force: !!command.force,
            alter: !command.force
        });
    });

program.parse(process.argv);
