import {Elastic} from "./Elastic";

export class EsIndex {

    public es: Elastic;

    constructor(
        protected index: string,
    ) {
        if (!index) {
            throw new Error('Index and type are required');
        }

        this.es = new Elastic(index);
    }

    public async updateData() {
        await this.updateIndexData();
    }

    private async updateIndexData() {
        try {
            await Elastic.checkConnection();

            await this.resetIndex();

            await this.createData(this.es.bulkCreate.bind(this));
            console.log('[Index data updated successfully]');
        } catch (e) {
            console.error('Updating index error:');
            console.error(e);
        }
    }

    protected async createData(storeFn: Function): Promise<void> {
        throw new Error('Override createData method');
    }

    protected async createMapping(): Promise<Object> {
        return null;
    }

    protected createSettings(): any {
        return null;
    }

    private async resetIndex() {
        await this.es.createIndex();

        await this.es.clearIndex();

        const settings = this.createSettings();
        if(settings) {
            await this.es.setSettings(settings);
        }

        const schema = await this.createMapping();
        if (schema) {
            await this.es.setQuotesMapping(schema);
        }
    }
}
