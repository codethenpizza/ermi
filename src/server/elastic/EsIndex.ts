import {Elastic} from "./Elastic";

export class EsIndex {

    public es: Elastic;

    constructor(
        protected index: string,
        protected type?: string
    ) {
        if (!index) {
            throw new Error('Index and type are required');
        }

        this.es = new Elastic(index, type);
    }

    public async start() {
        await this.run();
    }

    private async run() {
        try {
            await Elastic.checkConnection();

            await this.es.createIndex();

            const settings = this.createSettings();
            if(settings) {
                await this.es.setSettings(settings);
            }

            const schema = this.createMapping();
            if (schema) {
                await this.es.setQuotesMapping(schema);
            }

            await this.es.clearIndex();

            await this.createData(this.es.bulkCreate.bind(this));
            console.log('[Index updated successfully]');
        } catch (e) {
            console.error('Updating index error:');
            console.error(e);
        }
    }

    protected async createData(storeFn: Function): Promise<void> {
        throw new Error('Override createData method');
    }

    protected createMapping(): any {
        return null;
    }

    protected createSettings(): any {
        return null;
    }

}
