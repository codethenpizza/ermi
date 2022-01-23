export abstract class MigrationStore {
    abstract init(): Promise<void>;
    abstract save(set: MigrationSet): Promise<void>;
    abstract load(): Promise<MigrationSet>;
}

export interface MigrationSet {
    lastRun: string;
    migrations: MigrationEntity[];
}

export interface MigrationEntity {
    name: string;
    timestamp: number;
    lastRun: boolean;
}
