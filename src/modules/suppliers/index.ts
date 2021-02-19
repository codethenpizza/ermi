import {fetchAll, storeAll} from './runner'
import "@db";

const main = async () => {
    console.log(new Date());
    await fetchAll();
    await storeAll();
    console.log(new Date());
};

main()
    .then(() => {
        console.log('store complete');
        process.exit(0);
    })
    .catch((e) => {
        console.log('err', e);
        process.exit(1);
    });
