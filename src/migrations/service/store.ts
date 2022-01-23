import {MigrationSet, MigrationStore} from "./types";
import {migrationSequelizeTs} from "./db";
// @ts-ignore
import Migration from "./Migration.model";

export class MStore implements MigrationStore {

    db = migrationSequelizeTs;

    async init(): Promise<void> {
        await Migration.sync();
    }

    async load(): Promise<MigrationSet> {
        const migrations = await Migration.findAll({order: [['timestamp', 'ASC']], raw: true});
        const lastRun = migrations.find(x => x.lastRun)?.name;
        return {
            // @ts-ignore
            migrations,
            lastRun
        }
    }

    async save({migrations, lastRun}: MigrationSet): Promise<void> {
        await Migration.truncate();
        const updatedMigrations = migrations
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(x => ({...x, lastRun: x.name === lastRun}));
        await Migration.bulkCreate(updatedMigrations);
    }

}
