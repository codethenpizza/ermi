export default function progressBar(current: number, total: number, processName: string = 'Loading') {
    const currentNum = Math.floor(current / total * 100);
    const isComplete = current === total;
    const dots = isComplete ? "=".repeat(currentNum) : "=".repeat(currentNum - 1) + '>';
    const left = 100 - currentNum;
    const empty = " ".repeat(left);

    let loadingBar = `\r${processName}: (${currentNum}%) [${dots}${empty}]`;
    if (isComplete) {
        loadingBar = `\r${processName}: (${currentNum}%) Complete! [${dots}${empty}]\n`
    }
    process.stdout.write(loadingBar);
}
