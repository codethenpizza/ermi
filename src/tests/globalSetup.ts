import 'tsconfig-paths/register';
import {getElasticProductService} from "@core/services/elastic";
import {sequelizeTs} from "@core/database";
import {migrationSequelizeTs} from "../migrations/service/db";
import {MStore} from "../migrations/service/store";
import {Migrate} from "../migrations/service";

const elasticProductService = getElasticProductService();

export default async () => {
    await sequelizeTs.sync({
        force: true,
    });
    await migrationSequelizeTs.sync({
        force: true,
    });

    const store = new MStore();
    const migrate = new Migrate(store);
    await migrate.init();
    await migrate.syncFiles();
    await migrate.allUp();

    await elasticProductService.checkConnection();

    await elasticProductService.resetIndex();
}
