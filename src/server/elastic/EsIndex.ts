import {Elastic} from "./Elastic";

export class EsIndex {

    public es: Elastic;

    constructor(
        protected index,
        protected type
    ) {
        if (!index || !type) {
            console.log(index, type);
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


            const schema = this.createMapping();
            if (schema) {
                await this.es.setQuotesMapping(schema);
            }

            const data = await this.createData();
            await this.es.bulkCreate(data);
            console.log('[Index updated successfully]');
        } catch (e) {
            console.error('Updating index error:');
            console.error(e);
        }
    }

    protected async createData(): Promise<(Object & { id: number })[]> {
        throw new Error('Override createData method');
    }

    protected createMapping(): any {
        return false;
    }

}
