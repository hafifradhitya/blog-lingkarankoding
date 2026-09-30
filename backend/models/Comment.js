const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BlogPost",
            required: [true, "Post ID wajib diisi"],
            index: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author komentar wajib diisi"],
            index: true,
        },
        content: {
            type: String,
            required: [true, "Isi komentar tidak boleh kosong"],
            trim: true,
            maxlength: [1000, "Komentar maksimal 1000 karakter"],
        },
        // Referensi ke komentar induk untuk threaded/nested reply
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Comment", CommentSchema);