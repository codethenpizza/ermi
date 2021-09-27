import https from "https";

export const bufferFromStream = (stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<Buffer> =>
    new Promise(resolve => {
        const chunks = [];
        stream
            .on('data', (data) => chunks.push(data))
            .on('end', () => resolve(Buffer.concat(chunks)));
    });


export const splitImageNameByExt = (str: string): { ext: string, name: string } => {
    const ext = str.split('.').pop();
    const name = str.split(new RegExp(`.${ext}$`)).shift();

    return {ext, name};
}

export const getFileNameFromUrl = (url: string): string => url.split('/').pop();

export const getImageFromUrl = async (url: string): Promise<Buffer> =>
    new Promise<Buffer>((resolve, reject) => {
        https.get(url, res => {
            if (res.statusCode === 200) {
                bufferFromStream(res).then(x => resolve(x));
            } else {
                reject('Wrong url');
            }
        });
    });

export const isDev = process.env.NODE_ENV === 'development';
