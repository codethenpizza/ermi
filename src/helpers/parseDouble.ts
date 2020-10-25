export default function parseDouble (val: string): number {
    if (!val) {
        return null;
    }
    const value = parseFloat(val.replace(',', '.'));
    if (!isNaN(value)) {
        return value;
    } else {
        console.error(`parseDouble error with value: ${val}`);
        return null;
    }
};
