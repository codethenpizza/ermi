export const getRandomNumber = (len = 5): number => {
    return parseInt((Math.random() * (10 ** len)).toString());
}
