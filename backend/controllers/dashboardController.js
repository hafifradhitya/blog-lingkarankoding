const BlogPost = require("../models/BlogPost");
const Comment = require("../models/Comment");
const User = require("../models/User");

// @desc    Mendapatkan ringkasan statistik untuk User Dashboard (Penulis/Member)
// @route   GET /api/dashboard/summary
// @access  Private (Memerlukan token login)
const getUserDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        // Hitung total artikel milik user
        const [totalPosts, totalPublished, totalDrafts] = await Promise.all([
            BlogPost.countDocuments({ author: userId }),
            BlogPost.countDocuments({ author: userId, isDraft: false }),
            BlogPost.countDocuments({ author: userId, isDraft: true }),
        ]);

        // Hitung total views dan likes yang diperoleh user dari semua artikelnya
        const postStats = await BlogPost.aggregate([
            { $match: { author: userId } },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
                },
            },
        ]);

        const totalViews = postStats[0]?.totalViews || 0;
        const totalLikes = postStats[0]?.totalLikes || 0;

        // Hitung total komentar yang masuk pada artikel-artikel milik user
        const userPostIds = await BlogPost.find({ author: userId }).distinct("_id");
        const totalComments = await Comment.countDocuments({ post: { $in: userPostIds } });

        // Total artikel yang disimpan oleh user di bookmark
        const userDoc = await User.findById(userId).select("savedPosts");
        const totalBookmarks = userDoc?.savedPosts ? userDoc.savedPosts.length : 0;

        // Total artikel yang di-like dan total komentar yang ditulis oleh user ini
        const [totalLikedPosts, totalUserComments] = await Promise.all([
            BlogPost.countDocuments({ likes: userId, isDraft: false }),
            Comment.countDocuments({ author: userId }),
        ]);

        // 5 artikel terbaru milik user
        const recentPosts = await BlogPost.find({ author: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title slug isDraft views likes category createdAt coverImageUrl");

        return res.status(200).json({
            success: true,
            summary: {
                totalPosts,
                totalPublished,
                totalDrafts,
                totalViews,
                totalLikes,
                totalComments,
                totalBookmarks,
                totalLikedPosts,
                totalUserComments,
            },
            recentPosts,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil ringkasan dashboard user.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan daftar postingan milik user saat ini (My Posts) dengan pagination & filter
// @route   GET /api/dashboard/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const { status, search } = req.query;

        const filter = { author: userId };

        if (status === "published") {
            filter.isDraft = false;
        } else if (status === "draft") {
            filter.isDraft = true;
        }

        if (search) {
            filter.title = { $regex: search.trim(), $options: "i" };
        }

        const [posts, totalPosts] = await Promise.all([
            BlogPost.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author", "name email profileImageUrl"),
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
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar postingan saya.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan ringkasan statistik global platform untuk Admin Dashboard
// @route   GET /api/dashboard/admin/summary
// @access  Private (Khusus Admin)
const getAdminDashboardSummary = async (req, res) => {
    try {
        const [
            totalUsers,
            totalMembers,
            totalAdmins,
            totalPosts,
            totalPublished,
            totalDrafts,
            totalComments,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "member" }),
            User.countDocuments({ role: "admin" }),
            BlogPost.countDocuments(),
            BlogPost.countDocuments({ isDraft: false }),
            BlogPost.countDocuments({ isDraft: true }),
            Comment.countDocuments(),
        ]);

        // Total views dan likes di seluruh platform
        const platformStats = await BlogPost.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
                },
            },
        ]);

        const totalViews = platformStats[0]?.totalViews || 0;
        const totalLikes = platformStats[0]?.totalLikes || 0;

        // Distribusi kategori artikel
        const categoryDistribution = await BlogPost.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { _id: 0, category: "$_id", count: 1 } },
            { $sort: { count: -1 } },
        ]);

        // 5 artikel terbaru di platform
        const recentPosts = await BlogPost.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("author", "name email profileImageUrl")
            .select("title slug isDraft views likes category createdAt author coverImageUrl");

        // 5 user terbaru yang mendaftar
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email role profileImageUrl createdAt");

        return res.status(200).json({
            success: true,
            summary: {
                totalUsers,
                totalMembers,
                totalAdmins,
                totalPosts,
                totalPublished,
                totalDrafts,
                totalComments,
                totalViews,
                totalLikes,
            },
            categoryDistribution,
            recentPosts,
            recentUsers,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil ringkasan dashboard admin.",
            error: err.message,
        });
    }
};

// @desc    Mendapatkan daftar semua pengguna untuk Admin Management
// @route   GET /api/dashboard/admin/users
// @access  Private (Khusus Admin)
const getAdminUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const { search, role } = req.query;

        const filter = {};

        if (role && role !== "all") {
            filter.role = role;
        }

        if (search) {
            const queryRegex = new RegExp(search.trim(), "i");
            filter.$or = [{ name: queryRegex }, { email: queryRegex }];
        }

        const [users, totalUsers] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-password"),
            User.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar pengguna.",
            error: err.message,
        });
    }
};

// @desc    Memperbarui peran pengguna (Promote/Demote Role)
// @route   PUT /api/dashboard/admin/users/:id/role
// @access  Private (Khusus Admin)
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !["admin", "member"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role harus berupa 'admin' atau 'member'.",
            });
        }

        // Cegah admin mengubah rolenya sendiri menjadi member agar tidak kehilangan akses
        if (req.user._id.toString() === id.toString() && role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "Anda tidak dapat menghapus hak akses admin dari akun Anda sendiri.",
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Role pengguna berhasil diubah menjadi ${role}.`,
            user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui peran pengguna.",
            error: err.message,
        });
    }
};

// @desc    Menghapus pengguna oleh Admin
// @route   DELETE /api/dashboard/admin/users/:id
// @access  Private (Khusus Admin)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Cegah admin menghapus dirinya sendiri
        if (req.user._id.toString() === id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Anda tidak dapat menghapus akun Anda sendiri.",
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan.",
            });
        }

        // Hapus artikel dan komentar milik user ini secara bersih
        const userPosts = await BlogPost.find({ author: id }).distinct("_id");
        await Comment.deleteMany({ post: { $in: userPosts } });
        await Comment.deleteMany({ author: id });
        await BlogPost.deleteMany({ author: id });
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Pengguna beserta seluruh artikel dan komentarnya berhasil dihapus.",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus pengguna.",
            error: err.message,
        });
    }
};

module.exports = {
    getUserDashboardSummary,
    getMyPosts,
    getAdminDashboardSummary,
    getAdminUsers,
    updateUserRole,
    deleteUser,
};
