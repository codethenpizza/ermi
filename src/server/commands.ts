import program from 'commander';
import {updateIndexes} from "./elastic";
import {getCacheStrategy} from "@core/cache/CacheStrategy";

// TODO move js to root/scripts

program
    .command('es <action>')
    .description('Available actions: update-index')
    .action(async (action) => {
        switch (action) {
            case 'update-index':
                await updateIndexes();
                process.exit(0);
                break;

            default:
                console.log('Command not found');
        }
    });

program.parse(process.argv);
