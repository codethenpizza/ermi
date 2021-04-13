import cron from 'node-cron';
import {fetchAll, storeAll} from "../modules/suppliers/runner";
import {updateProductIndexes} from "@server/elastic";

export const setCronTasks = (): void => {
    // [minute] [hour] [day of month] [month] [day of week]
    const EVERY_DAY = '0 0 * * *';
    cron.schedule(EVERY_DAY, async () => {
        console.log('CronTasks start');
        await parseSuppliers();
        await updateProductIndexes();
        console.log('CronTasks complete');
    }, {
        timezone: 'Europe/Moscow'
    });
};

const parseSuppliers = async () => {
    console.log('Suppliers parse start at ', new Date());
    await fetchAll();
    await storeAll();
    console.log('Suppliers parse end at ', new Date());
};
