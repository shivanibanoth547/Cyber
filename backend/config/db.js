const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

let cached = global._mongooseConnection;
if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = MONGODB_URI.trim();
        console.log(`[DB] Connecting to MongoDB...`);
        cached.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }).then((m) => {
            console.log(`[DB] MongoDB connected: ${m.connection.host}`);
            return m;
        }).catch((error) => {
            console.error(`[DB] Connection error: ${error.message}`);
            cached.promise = null;
            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;
