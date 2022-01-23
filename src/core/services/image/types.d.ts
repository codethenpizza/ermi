export interface IImageServiceConfig {
    sizes: IImageServiceSizes;
}

export type IImageServiceSize = 'large' | 'medium' | 'small' | 'thumbnail';

export type IImageServiceSizes = {
    [x in IImageServiceSize]: {
        width: number;
        height: number | null;
    };
};
