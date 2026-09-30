const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Nama lengkap wajib diisi"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email wajib diisi"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Silakan masukkan format email yang valid",
            ],
        },
        password: {
            type: String,
            required: [true, "Password wajib diisi"],
            minlength: [6, "Password minimal 6 karakter"],
        },
        profileImageUrl: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            default: "",
            trim: true,
            maxlength: [250, "Bio maksimal 250 karakter"],
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
        },
        // Menyimpan bookmark/postingan yang disimpan oleh user
        savedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "BlogPost",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", UserSchema);
