const mongoose = require("mongoose");

const BlogPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Judul artikel wajib diisi"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug artikel wajib diisi"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        content: {
            type: String,
            required: [true, "Konten artikel wajib diisi"],
        },
        summary: {
            type: String,
            default: "",
            trim: true,
            maxlength: [500, "Ringkasan maksimal 500 karakter"],
        },
        coverImageUrl: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            required: [true, "Kategori artikel wajib diisi"],
            trim: true,
            default: "General",
            index: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author wajib diisi"],
            index: true,
        },
        isDraft: {
            type: Boolean,
            default: false,
            index: true,
        },
        views: {
            type: Number,
            default: 0,
            index: true,
        },
        // Daftar User ID yang memberikan Like (menghindari multiple like oleh user yang sama)
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        generatedByAI: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual property untuk menghitung total likes secara instan
BlogPostSchema.virtual("likeCount").get(function () {
    return Array.isArray(this.likes) ? this.likes.length : 0;
});

// Text index untuk pencarian cepat judul, konten, kategori, dan tags
BlogPostSchema.index({
    title: "text",
    content: "text",
    category: "text",
    tags: "text",
});

module.exports = mongoose.model("BlogPost", BlogPostSchema);