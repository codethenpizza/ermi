import cron from 'node-cron';
import {parseSuppliers} from "../modules/suppliers";

export const setCronTasks = (): void => {
    // [minute] [hour] [day of month] [month] [day of week]
    const EVERY_DAY = '0 0 * * *';
    cron.schedule(EVERY_DAY, async () => {
        console.log('CronTasks start');
        await parseSuppliers();
        console.log('CronTasks complete');
    }, {
        timezone: 'Europe/Moscow'
    });
};

