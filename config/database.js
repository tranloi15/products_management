const mongoose = require("mongoose");

let isConnected = false;

const connect = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URL, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = db.connections[0].readyState === 1;
        console.log("Connect Success!");
    } catch (error) {
        console.error("Connect Error:", error);
        throw error;
    }
};

module.exports = {
    connect,
};