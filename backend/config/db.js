const mongoose = require("mongoose");
const dns = require("dns");

// Set public DNS servers to resolve SRV records properly on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        console.error("👉 Catatan: Jika menggunakan MongoDB Atlas, pastikan IP Address Anda sudah di-whitelist (atau gunakan 0.0.0.0/0) di MongoDB Atlas Console -> Security -> Network Access.");
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
