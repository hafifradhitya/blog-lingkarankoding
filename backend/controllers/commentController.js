const Comment = require("../models/Comment");
const BlogPost = require("../models/BlogPost");
const User = require("../models/User");

// Helper untuk mengamankan string pencarian dari karakter spesial Regex
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// @desc    Menambahkan komentar baru atau balasan komentar (Threaded Reply)
// @route   POST /api/comments
// @access  Private (Memerlukan token login)
const addComment = async (req, res) => {
    try {
        const { postId, content, parentComment } = req.body;

        if (!postId || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post ID dan isi komentar wajib diisi.",
            });
        }

        // Pastikan artikel yang dikomentari ada
        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        // Jika merupakan balasan (reply), validasi keberadaan parentComment
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: "Komentar induk yang dibalas tidak ditemukan.",
                });
            }
            if (parent.post.toString() !== postId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Komentar induk tidak sesuai dengan artikel ini.",
                });
            }
        }

        const newComment = await Comment.create({
            post: postId,
            author: req.user._id,
            content: content.trim(),
            parentComment: parentComment || null,
        });

        const populatedComment = await Comment.findById(newComment._id).populate(
            "author",
            "name email profileImageUrl bio role"
        );

        return res.status(201).json({
            success: true,
            message: "Komentar berhasil ditambahkan.",
            comment: populatedComment,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan komentar.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan semua komentar untuk sebuah artikel
// @route   GET /api/comments/post/:postId
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: 1 }) // Urutkan dari komentar terlama ke terbaru
            .populate("author", "name email profileImageUrl bio role");

        return res.status(200).json({
            success: true,
            count: comments.length,
            comments,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar komentar.",
            error: err.message,
        });
    }
};

// @desc    Menghapus komentar (Penulis komentar, Penulis artikel, atau Admin)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Komentar tidak ditemukan.",
            });
        }

        // Cek apakah user adalah pembuat komentar, pembuat artikel, atau admin
        const post = await BlogPost.findById(comment.post);
        const isCommentAuthor = comment.author.toString() === req.user._id.toString();
        const isPostAuthor = post && post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak. Anda tidak berhak menghapus komentar ini.",
            });
        }

        // Hapus juga balasan turunan yang merujuk ke komentar ini (Cascading Reply Delete)
        await Comment.deleteMany({ parentComment: comment._id });
        await Comment.findByIdAndDelete(comment._id);

        return res.status(200).json({
            success: true,
            message: "Komentar beserta balasannya berhasil dihapus.",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus komentar.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan semua komentar untuk moderasi Admin Dashboard (dengan pagination & search)
// @route   GET /api/comments/admin/all
// @access  Private (Khusus Admin)
const getAllCommentsAdmin = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const { search, q } = req.query;
        const searchKeyword = (search || q || "").trim();

        const filter = {};

        if (searchKeyword) {
            const escapedKeyword = escapeRegex(searchKeyword);
            const queryRegex = new RegExp(escapedKeyword, "i");

            // Cari ID pengguna yang nama atau emailnya cocok
            const matchedUsers = await User.find({
                $or: [{ name: queryRegex }, { email: queryRegex }],
            }).select("_id");
            const matchedUserIds = matchedUsers.map((u) => u._id);

            // Cari ID artikel yang judulnya cocok
            const matchedPosts = await BlogPost.find({
                title: queryRegex,
            }).select("_id");
            const matchedPostIds = matchedPosts.map((p) => p._id);

            filter.$or = [
                { content: queryRegex },
                { author: { $in: matchedUserIds } },
                { post: { $in: matchedPostIds } },
            ];
        }

        const [comments, totalComments] = await Promise.all([
            Comment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author", "name email profileImageUrl role")
                .populate("post", "title slug coverImageUrl"),
            Comment.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalComments / limit) || 1;

        return res.status(200).json({
            success: true,
            comments,
            pagination: {
                totalComments,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar komentar admin.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan daftar komentar yang ditulis oleh user saat ini
// @route   GET /api/comments/user/my-comments
// @access  Private
const getMyComments = async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.user._id })
            .sort({ createdAt: -1 })
            .populate("post", "title slug coverImageUrl category")
            .populate("author", "name email profileImageUrl");

        return res.status(200).json({
            success: true,
            comments: comments || [],
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal memuat daftar komentar saya.",
            error: err.message,
        });
    }
};

module.exports = {
    addComment,
    getPostComments,
    deleteComment,
    getAllCommentsAdmin,
    getMyComments,
};
