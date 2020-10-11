import {fetchAll, storeAll} from './runner'
import "@db";

const main = async () => {
    await fetchAll();
    await storeAll();
};

main()
    .then(() => {
        console.log('store complete');
        process.exit(0);
    })
    .catch((e) => {
        console.log('err', e);
    });
