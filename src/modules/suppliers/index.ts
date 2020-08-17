import {fetchAll} from './runner'
import "@db";

const main = async () => {
    await fetchAll()
};

main()
    .then(() => {
        console.log('fetch complete')
    })
    .catch((e) => {
        console.log('err', e)
    });