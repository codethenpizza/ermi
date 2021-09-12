export default function parseDouble(val: string): number {
    if (!val) {
        return null;
    }
    const strVal = val.replace(/[  ]/g, '').replace(',', '.');
    const value = parseFloat(strVal);
    if (!isNaN(value)) {
        return value;
    } else {
        console.error(`parseDouble error with value: ${val}`);
        return null;
    }
};
