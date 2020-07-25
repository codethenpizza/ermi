import mongoose, {ConnectionOptions} from "mongoose";

export const connectDb = async (uri: string, options: ConnectionOptions) => {
    const connect = async () => {
        try {
            await mongoose.connect(uri, Object.assign({useNewUrlParser: true, useUnifiedTopology: true}, options));
            return console.log(`Successfully connected to ${uri}`);
        } catch (error) {
            console.log("Error connecting to database: ", error);
            return process.exit(1);
        }
    };
    await connect();

    mongoose.connection.on("disconnected", connect);
};
