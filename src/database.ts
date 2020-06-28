import mongoose, {ConnectionOptions} from "mongoose";

export const connectDb = (uri: string, options: ConnectionOptions) => {
    const connect = () => {
        mongoose
            .connect(uri, Object.assign({useNewUrlParser: true,}, options))
            .then(() => {
                return console.log(`Successfully connected to ${uri}`);
            })
            .catch(error => {
                console.log("Error connecting to database: ", error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on("disconnected", connect);
};
