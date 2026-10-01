const express = require("express");
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Auth Endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

const fs = require("fs");

// Image Upload Endpoint
router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Jika berjalan di lingkungan Vercel serverless (di mana disk /tmp dibersihkan berkala),
    // simpan gambar sebagai Base64 data URL agar persisten di MongoDB selamanya
    if (process.env.VERCEL) {
        try {
            const fileBuffer = fs.readFileSync(req.file.path);
            const mimeType = req.file.mimetype || "image/jpeg";
            const base64Data = fileBuffer.toString("base64");
            const dataUrl = `data:${mimeType};base64,${base64Data}`;

            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                // Ignore cleanup error in tmp
            }

            return res.status(200).json({ success: true, imageUrl: dataUrl });
        } catch (err) {
            console.error("Gagal memproses file upload di Vercel:", err);
        }
    }

    // Lingkungan lokal: kembalikan URL path relatif /uploads/
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, imageUrl });
});

module.exports = router;