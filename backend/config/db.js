const mongoose = require("mongoose");
const dns = require("dns");

// Set public DNS servers to resolve SRV records properly on Windows
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
    // Ignore error if not permitted in certain serverless environments
}

let isConnected = false;

const connectDB = async () => {
    // Jika koneksi sudah aktif (reuse connection in serverless), jangan reconnect lagi
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
            bufferCommands: false, // Matikan buffer agar langsung fail fast jika ada problem
        });
        isConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
    }
};

mongoose.connection.on("connected", () => {
    console.log("🔗 Mongoose connection active");
});

mongoose.connection.on("error", (err) => {
    console.error("⚠️ Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ Mongoose connection disconnected");
});

module.exports = connectDB;
