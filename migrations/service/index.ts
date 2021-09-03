import {MigrationEntity, MigrationStore} from "./types";
import * as path from "path";
import slugify from "slugify";
import * as fs from "fs";
import {Transaction} from "sequelize";
// @ts-ignore
import {migrationSequelizeTs} from "./db";

export class Migrate {

    private dir = path.join(__dirname, '..');

    constructor(
        private store: MigrationStore
    ) {
    }

    async init(): Promise<void> {
        await this.store.init();
        console.log('Migrations store successfully init');
    }

    async syncFiles(): Promise<void> {
        const {lastRun, migrations} = await this.store.load();

        const migrationNames = migrations.map(x => x.name);

        const tsFilePattern = /\.ts$/;
        const files = fs
            .readdirSync(this.dir, {withFileTypes: true})
            .filter(x =>
                x.isFile() &&
                tsFilePattern.test(x.name) &&
                !migrationNames.includes(x.name)
            );

        const parseFile = (name: string): MigrationEntity => {
            const [timestamp] = name.split('-');
            return {timestamp: parseInt(timestamp, 10), name, lastRun: false};
        }

        const newMigrations = files.map(x => parseFile(x.name));

        migrations.push(...newMigrations);

        await this.store.save({lastRun, migrations});
    }

    async create(name?: string): Promise<string> {
        const fileName = await this.templateGenerator(name);
        const {lastRun, migrations} = await this.store.load();

        await this.store.save({
            lastRun,
            migrations: [
                {lastRun: false, name: fileName, timestamp: Date.now()},
                ...migrations,
            ]
        });

        console.log('Create migration file - ' + fileName);

        return fileName;
    }

    async allUp(): Promise<void> {
        const {migrations} = await this.store.load();
        if (!migrations.length) {
            console.log('There are no migrations');
            return;
        }

        await this.up(migrations.pop().name);
    }

    async allDown(): Promise<void> {
        const {migrations} = await this.store.load();
        if (!migrations.length) {
            console.log('There are no migrations');
            return;
        }

        await this.up(migrations.shift().name);
    }

    async up(name?: string): Promise<void> {
        const {migrations, lastRun} = await this.store.load();

        if (!migrations.length) {
            console.log('There are no migrations');
            return;
        }

        const lastRunIndex = migrations.findIndex(x => x.name === lastRun);
        const targetIndex = migrations.findIndex(x => x.name === name);

        if (name && (targetIndex === -1 || lastRunIndex >= targetIndex)) {
            console.log('Error: wrong migration name', name, targetIndex, lastRunIndex);
            return;
        }

        const start = lastRunIndex + 1;
        const end = name ? targetIndex + 1 : start + 1;
        const targetMigrations = migrations.slice(start, end);

        if (!targetMigrations.length) {
            console.log('Migrations is up-to-date');
            return;
        }

        const transaction = await migrationSequelizeTs.transaction();
        try {
            for (const migration of targetMigrations) {
                await this.runMigration(migration, 'up', transaction);
            }

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }

        const lastRunMigrationName = migrations[end - 1].name;

        await this.store.save({migrations, lastRun: lastRunMigrationName})
    }

    async down(name?: string): Promise<void> {
        const {migrations, lastRun} = await this.store.load();

        if (!migrations.length) {
            console.log('There are no migrations');
            return;
        }

        migrations.reverse();

        const lastRunIndex = migrations.findIndex(x => x.name === lastRun);
        const targetIndex = migrations.findIndex(x => x.name === name);

        if (lastRunIndex === -1) {
            console.log('No migrations were ran');
            return;
        }

        if (name && (targetIndex === -1 || lastRunIndex >= targetIndex)) {
            console.log('Error: wrong migration name');
            return;
        }

        const start = lastRunIndex;
        const end = name ? targetIndex + 1 : start + 1;
        const targetMigrations = migrations.slice(start, end);

        if (!targetMigrations.length) {
            console.log('Migrations is up-to-date');
            return;
        }

        const transaction = await migrationSequelizeTs.transaction();
        try {
            for (const migration of targetMigrations) {
                await this.runMigration(migration, 'down', transaction);
            }

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }

        const lastRunMigrationName = end === migrations.length ? null : migrations[end].name;

        await this.store.save({migrations, lastRun: lastRunMigrationName})
    }

    private async runMigration({name}: MigrationEntity, direction: 'up' | 'down', transaction: Transaction): Promise<void> {
        const module = await import(path.join(this.dir, name));

        console.log(`Run ${direction.toUpperCase()} ${name} migration`);

        await module[direction](transaction);
    }

    private async templateGenerator(name?: string): Promise<string> {
        const tmplPath = path.join(__dirname, 'template.ts');
        const template = await this.loadTemplate(tmplPath);
        const fileName = slugify(Date.now() + (name ? '-' + name : ''), {lower: true}) + '.ts';
        const filePath = path.join(this.dir, fileName)

        fs.writeFileSync(filePath, template);

        return fileName;
    };

    private async loadTemplate(path: string): Promise<string> {
        return fs.readFileSync(path, {
            encoding: 'utf8'
        })
    };
}
