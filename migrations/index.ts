import {sequelize} from "../src/database";

(async () => {
    sequelize.sync({force: true}).then(() => {
        process.exit(0);
    });
})();
