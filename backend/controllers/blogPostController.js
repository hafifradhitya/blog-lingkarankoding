const BlogPost = require("../models/BlogPost");
const Comment = require("../models/Comment");
const User = require("../models/User");

// Helper untuk menghasilkan slug yang ramah SEO dari judul artikel
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Hapus karakter spesial
        .replace(/\s+/g, "-")      // Ganti spasi dengan tanda hubung (-)
        .replace(/-+/g, "-");      // Hindari duplikasi tanda hubung
};

// Helper untuk mengamankan string pencarian dari karakter spesial Regex
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// @desc    Membuat postingan blog baru
// @route   POST /api/posts
// @access  Private (Memerlukan token login)
const createPost = async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            tags,
            coverImageUrl,
            summary,
            isDraft,
            slug: customSlug,
            generatedByAI,
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Judul dan konten artikel wajib diisi.",
            });
        }

        // Tentukan slug (gunakan custom slug jika disediakan, atau generate dari judul)
        const baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(title);
        let uniqueSlug = baseSlug;
        let counter = 1;

        // Pastikan slug unik di database
        while (await BlogPost.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Format tags jika dikirim sebagai string yang dipisah koma
        let formattedTags = [];
        if (Array.isArray(tags)) {
            formattedTags = tags.map((t) => String(t).trim()).filter(Boolean);
        } else if (typeof tags === "string") {
            formattedTags = tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        }

        const newPost = await BlogPost.create({
            title: title.trim(),
            slug: uniqueSlug,
            content,
            summary: summary ? summary.trim() : "",
            coverImageUrl: coverImageUrl || null,
            category: category ? category.trim() : "General",
            tags: formattedTags,
            author: req.user._id,
            isDraft: Boolean(isDraft),
            generatedByAI: Boolean(generatedByAI),
        });

        const populatedPost = await BlogPost.findById(newPost._id).populate(
            "author",
            "name email profileImageUrl bio role"
        );

        return res.status(201).json({
            success: true,
            message: "Artikel berhasil dipublikasikan.",
            post: populatedPost,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal membuat artikel baru.",
            error: err.message,
        });
    }
};

// @desc    Memperbarui artikel yang sudah ada
// @route   PUT /api/posts/:id
// @access  Private (Penulis artikel atau Admin)
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        // Validasi hak akses: Hanya pembuat artikel atau admin yang berhak mengedit
        const isAuthor = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak. Anda tidak memiliki izin untuk mengedit artikel ini.",
            });
        }

        const {
            title,
            content,
            category,
            tags,
            coverImageUrl,
            summary,
            isDraft,
            slug: customSlug,
        } = req.body;

        if (title && title.trim() !== post.title) {
            post.title = title.trim();
            // Perbarui slug jika judul berubah dan tidak ada custom slug
            const baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(title);
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (await BlogPost.findOne({ slug: uniqueSlug, _id: { $ne: post._id } })) {
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            post.slug = uniqueSlug;
        } else if (customSlug && customSlug !== post.slug) {
            const baseSlug = generateSlug(customSlug);
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (await BlogPost.findOne({ slug: uniqueSlug, _id: { $ne: post._id } })) {
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            post.slug = uniqueSlug;
        }

        if (content) post.content = content;
        if (category) post.category = category.trim();
        if (typeof summary !== "undefined") post.summary = summary ? summary.trim() : "";
        if (typeof coverImageUrl !== "undefined") post.coverImageUrl = coverImageUrl;
        if (typeof isDraft !== "undefined") post.isDraft = Boolean(isDraft);

        if (tags) {
            if (Array.isArray(tags)) {
                post.tags = tags.map((t) => String(t).trim()).filter(Boolean);
            } else if (typeof tags === "string") {
                post.tags = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
        }

        await post.save();

        const updatedPost = await BlogPost.findById(post._id).populate(
            "author",
            "name email profileImageUrl bio role"
        );

        return res.status(200).json({
            success: true,
            message: "Artikel berhasil diperbarui.",
            post: updatedPost,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui artikel.",
            error: err.message,
        });
    }
};

// @desc    Menghapus artikel
// @route   DELETE /api/posts/:id
// @access  Private (Penulis artikel atau Admin)
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        const isAuthor = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak. Anda tidak memiliki izin untuk menghapus artikel ini.",
            });
        }

        // Hapus komentar yang terafiliasi dengan postingan ini
        await Comment.deleteMany({ post: post._id });

        // Hapus postingan ini dari daftar bookmark (savedPosts) semua user
        await User.updateMany(
            { savedPosts: post._id },
            { $pull: { savedPosts: post._id } }
        );

        await BlogPost.findByIdAndDelete(post._id);

        return res.status(200).json({
            success: true,
            message: "Artikel beserta komentarnya berhasil dihapus.",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus artikel.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan semua postingan (dengan pagination, filter kategori, tags, & sorting)
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 9);
        const skip = (page - 1) * limit;

        const { category, tag, author, isDraft, sort, status, includeDrafts, search, q } = req.query;

        // Query filter dasar
        const filter = {};

        // Filter status artikel (draft / terpublikasi / semua)
        if (status === "draft" || isDraft === "true") {
            filter.isDraft = true;
        } else if (status === "published" || isDraft === "false") {
            filter.isDraft = false;
        } else if (status === "all" || includeDrafts === "true") {
            // Tampilkan semua artikel baik draft maupun terpublikasi (tidak set filter.isDraft)
        } else {
            // Default untuk publik: hanya tampilkan yang terpublikasi
            filter.isDraft = false;
        }

        if (category && category !== "All" && category !== "Semua") {
            filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

        if (tag) {
            filter.tags = { $in: [new RegExp(`^${tag.trim()}$`, "i")] };
        }

        if (author) {
            filter.author = author;
        }

        // Pencarian berdasarkan keyword (search / q)
        const searchKeyword = (search || q || "").trim();
        if (searchKeyword) {
            const queryRegex = new RegExp(escapeRegex(searchKeyword), "i");
            filter.$or = [
                { title: queryRegex },
                { content: queryRegex },
                { summary: queryRegex },
                { category: queryRegex },
                { tags: queryRegex },
            ];
        }

        // Sorting options
        let sortOption = { createdAt: -1 }; // default terbaru
        if (sort === "popular") {
            sortOption = { views: -1, createdAt: -1 };
        } else if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const [posts, totalPosts] = await Promise.all([
            BlogPost.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate("author", "name email profileImageUrl bio role"),
            BlogPost.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalPosts / limit);

        return res.status(200).json({
            success: true,
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar artikel.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan detail artikel berdasarkan Slug
// @route   GET /api/posts/slug/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await BlogPost.findOne({ slug }).populate(
            "author",
            "name email profileImageUrl bio role"
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        return res.status(200).json({
            success: true,
            post,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil detail artikel.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan daftar artikel berdasarkan Tag tertentu
// @route   GET /api/posts/tag/:tag
// @access  Public
const getPostsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 9);
        const skip = (page - 1) * limit;

        const filter = {
            tags: { $in: [new RegExp(`^${tag.trim()}$`, "i")] },
            isDraft: false,
        };

        const [posts, totalPosts] = await Promise.all([
            BlogPost.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author", "name email profileImageUrl bio role"),
            BlogPost.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalPosts / limit);

        return res.status(200).json({
            success: true,
            tag,
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil artikel berdasarkan tag.",
            error: err.message,
        });
    }
};

// @desc    Pencarian artikel berdasarkan keyword (Title, Content, Summary, Tags, Category)
// @route   GET /api/posts/search
// @access  Public
const searchPosts = async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.trim() : "";
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 9);
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(200).json({
                success: true,
                query: "",
                posts: [],
                pagination: { totalPosts: 0, totalPages: 0, currentPage: page, limit },
            });
        }

        const queryRegex = new RegExp(escapeRegex(query), "i");

        const filter = {
            isDraft: false,
            $or: [
                { title: queryRegex },
                { content: queryRegex },
                { summary: queryRegex },
                { category: queryRegex },
                { tags: queryRegex },
            ],
        };

        const [posts, totalPosts] = await Promise.all([
            BlogPost.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author", "name email profileImageUrl bio role"),
            BlogPost.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalPosts / limit);

        return res.status(200).json({
            success: true,
            query,
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal melakukan pencarian artikel.",
            error: err.message,
        });
    }
};

// @desc    Menambah jumlah pembaca artikel (Increment View Count)
// @route   POST /api/posts/:id/view
// @access  Public
const incrementView = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        ).select("views title slug");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        return res.status(200).json({
            success: true,
            views: post.views,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal menambah counter pembaca.",
            error: err.message,
        });
    }
};

// @desc    Toggle Like / Unlike pada artikel
// @route   POST /api/posts/:id/like
// @access  Private (Memerlukan token login)
const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        const userId = req.user._id;
        const isLiked = post.likes.some((likeId) => likeId.toString() === userId.toString());

        if (isLiked) {
            // Jika sudah di-like, maka Unlike (hapus userId dari array)
            post.likes = post.likes.filter((likeId) => likeId.toString() !== userId.toString());
        } else {
            // Jika belum di-like, tambahkan userId ke array
            post.likes.push(userId);
        }

        await post.save();

        return res.status(200).json({
            success: true,
            liked: !isLiked,
            likeCount: post.likes.length,
            message: !isLiked ? "Artikel berhasil di-like." : "Like berhasil dibatalkan.",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal memproses like pada artikel.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan artikel terpopuler (Trending Posts)
// @route   GET /api/posts/trending
// @access  Public
const getTopPosts = async (req, res) => {
    try {
        const limit = Math.max(1, parseInt(req.query.limit) || 5);

        const posts = await BlogPost.find({ isDraft: false })
            .sort({ views: -1, createdAt: -1 })
            .limit(limit)
            .populate("author", "name email profileImageUrl bio role");

        return res.status(200).json({
            success: true,
            posts,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar artikel trending.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan semua daftar kategori yang memiliki artikel beserta total count
// @route   GET /api/posts/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await BlogPost.aggregate([
            { $match: { isDraft: false } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { _id: 0, name: "$_id", count: 1 } },
            { $sort: { count: -1 } },
        ]);

        return res.status(200).json({
            success: true,
            categories,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar kategori.",
            error: err.message,
        });
    }
};

// @desc    Toggle Bookmark / Simpan artikel ke daftar bacaan
// @route   POST /api/posts/:id/bookmark
// @access  Private (Memerlukan token login)
const toggleBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Artikel tidak ditemukan.",
            });
        }

        const user = await User.findById(req.user._id);
        const isBookmarked = user.savedPosts.some(
            (savedId) => savedId.toString() === id.toString()
        );

        if (isBookmarked) {
            user.savedPosts = user.savedPosts.filter(
                (savedId) => savedId.toString() !== id.toString()
            );
        } else {
            user.savedPosts.push(id);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            bookmarked: !isBookmarked,
            message: !isBookmarked
                ? "Artikel berhasil disimpan ke bookmark."
                : "Artikel berhasil dihapus dari bookmark.",
            savedPosts: user.savedPosts,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal memproses bookmark.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan semua artikel yang dibookmark oleh user yang sedang login
// @route   GET /api/posts/user/bookmarks
// @access  Private (Memerlukan token login)
const getBookmarkedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: "savedPosts",
            populate: {
                path: "author",
                select: "name email profileImageUrl bio role",
            },
        });

        return res.status(200).json({
            success: true,
            posts: user.savedPosts || [],
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar bookmark.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan semua artikel yang disukai oleh user yang sedang login
// @route   GET /api/posts/user/liked
// @access  Private (Memerlukan token login)
const getLikedPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find({ likes: req.user._id, isDraft: false })
            .sort({ updatedAt: -1 })
            .populate("author", "name email profileImageUrl bio role");

        return res.status(200).json({
            success: true,
            posts: posts || [],
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar artikel yang disukai.",
            error: err.message,
        });
    }
};

module.exports = {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getPostBySlug,
    getPostsByTag,
    searchPosts,
    incrementView,
    likePost,
    getTopPosts,
    getCategories,
    toggleBookmark,
    getBookmarkedPosts,
    getLikedPosts,
};