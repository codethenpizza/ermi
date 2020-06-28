import mongoose, {Document, Schema} from 'mongoose';

export interface IProduct extends Document {
    title: string;
    desc: string;
    cost: number;
}

const ProductSchema: Schema = new Schema({
    title: {type: String, required: true},
    desc: {type: String, required: true},
    cost: {type: String, required: true}
});

const Product = mongoose.model<IProduct>('product', ProductSchema);
export {Product};
