const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware untuk memproteksi endpoint dengan JWT
const protect = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Akses ditolak. Token autentikasi tidak ditemukan.",
            });
        }

        // Verifikasi token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Cari user berdasarkan ID dari payload JWT (kecualikan password)
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Sesi tidak valid. Pengguna tidak ditemukan.",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token tidak valid atau telah kedaluwarsa.",
            error: error.message,
        });
    }
};

// Middleware untuk membatasi akses hanya untuk Admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Endpoint ini hanya dapat diakses oleh Administrator.",
        });
    }
};

module.exports = { protect, adminOnly };
