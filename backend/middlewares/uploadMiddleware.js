const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Pastikan direktori uploads tersedia (gunakan /tmp di Vercel agar tidak error EROFS)
const uploadDir = process.env.VERCEL
    ? path.join(os.tmpdir(), "uploads")
    : path.join(__dirname, "../uploads");

try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn("Gagal membuat folder upload:", err.message);
}

// Konfigurasi penyimpanan disk multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Bersihkan nama file dari spasi dan karakter aneh
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, "-");
        cb(null, `${Date.now()}-${sanitizedOriginalName}`);
    },
});

// Filter tipe file gambar yang diizinkan
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Hanya file gambar (.jpeg, .jpg, .png, .webp) yang diizinkan"), false);
    }
};

// Batasan ukuran maksimum 5MB
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

module.exports = upload;