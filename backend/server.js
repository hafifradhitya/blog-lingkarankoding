require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const blogPostRoutes = require("./routes/blogPostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoute");

const app = express();

// Connect Database
connectDB();

// CORS configuration (Mendukung localhost, domain custom, dan semua deployment Vercel)
app.use(
    cors({
        origin: (origin, callback) => {
            // Izinkan request tanpa origin (mobile/curl/server-to-server) atau domain yang cocok
            if (!origin || origin.includes("localhost") || origin.endsWith(".vercel.app") || (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL))) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root and Health Check Routes
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Blog App Backend API is running",
        version: "1.0.0",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", blogPostRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard-summary", dashboardRoutes); // Alias
app.use("/api/ai", aiRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found`,
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.message);

    // Tangani error dari Multer (misal ukuran file melebihi limit)
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Ukuran file terlalu besar. Maksimum 5MB",
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer Error: ${err.message}`,
        });
    }

    // Tangani custom error message (misal tipe file ditolak)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
