const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper untuk membuat token JWT (kedaluwarsa dalam 7 hari)
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register pengguna baru (Member atau Admin jika menyertakan adminAccessToken)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, bio, adminAccessToken } = req.body;

        // Validasi kelengkapan field wajib
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Nama lengkap, email, dan password wajib diisi.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 6 karakter.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Cek apakah email sudah terdaftar
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
            });
        }

        // Hash password dengan bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tentukan peran pengguna: Admin jika menyertakan token akses admin yang cocok
        let role = "member";
        if (
            adminAccessToken &&
            process.env.ADMIN_ACCESS_TOKEN &&
            String(adminAccessToken).trim() === String(process.env.ADMIN_ACCESS_TOKEN).trim()
        ) {
            role = "admin";
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profileImageUrl: profileImageUrl || null,
            bio: bio ? bio.trim() : "",
            role,
        });

        // Response dengan data user (tanpa password) dan token
        return res.status(201).json({
            success: true,
            message: `Registrasi berhasil sebagai ${role}.`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                bio: user.bio,
                role: user.role,
                savedPosts: user.savedPosts || [],
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Register Error:", error.message);

        // Tangani error duplicate email dari MongoDB (E11000)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
            });
        }

        // Tangani error validasi Mongoose
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0]?.message;
            return res.status(400).json({
                success: false,
                message: firstError || "Data yang dikirim tidak valid.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server saat registrasi.",
            error: error.message,
        });
    }
};

// @desc    Login pengguna & dapatkan JWT
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        // Jangan kembalikan status 500 jika kredensial salah, gunakan 401 Unauthorized
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah.",
            });
        }

        // Verifikasi kesesuaian password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login berhasil.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                bio: user.bio,
                role: user.role,
                savedPosts: user.savedPosts || [],
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server saat login.",
            error: error.message,
        });
    }
};

// @desc    Mendapatkan profil pengguna yang sedang login
// @route   GET /api/auth/profile
// @access  Private (Memerlukan JWT Bearer Token)
const getUserProfile = async (req, res) => {
    try {
        // req.user sudah di-populate oleh protect middleware
        return res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data profil.",
            error: error.message,
        });
    }
};

// @desc    Update data profil pengguna
// @route   PUT /api/auth/profile
// @access  Private (Memerlukan JWT Bearer Token)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan.",
            });
        }

        const { name, bio, profileImageUrl, currentPassword, newPassword } = req.body;

        if (name) user.name = name.trim();
        if (typeof bio !== "undefined") user.bio = bio.trim();
        if (typeof profileImageUrl !== "undefined") user.profileImageUrl = profileImageUrl;

        // Jika user ingin memperbarui password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password saat ini wajib diisi untuk mengganti password baru.",
                });
            }

            const isCurrentMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Password saat ini salah.",
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password baru minimal 6 karakter.",
                });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "Profil berhasil diperbarui.",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileImageUrl: updatedUser.profileImageUrl,
                bio: updatedUser.bio,
                role: updatedUser.role,
                savedPosts: updatedUser.savedPosts || [],
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui profil pengguna.",
            error: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};
