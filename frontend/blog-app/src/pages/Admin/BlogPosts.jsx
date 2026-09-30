import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import { TableSkeleton } from "../../components/Common/SkeletonLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate } from "../../utils/helper";
import toast from "react-hot-toast";
import {
    LuPlus,
    LuSearch,
    LuPencil,
    LuTrash2,
    LuExternalLink,
    LuEye,
    LuHeart,
    LuMessageSquare,
    LuChevronLeft,
    LuChevronRight,
    LuRefreshCw,
    LuFileText,
    LuX,
    LuLoader,
} from "react-icons/lu";

const BlogPosts = () => {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all"); // 'all', 'published', 'draft'

    // Pagination State
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        limit: 10,
    });

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        postId: null,
        postTitle: "",
        isDeleting: false,
    });

    // Debounce effect untuk search realtime 500ms
    useEffect(() => {
        if (searchQuery.trim() !== debouncedSearch) {
            setIsSearching(true);
        }

        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
            setIsSearching(false);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery, debouncedSearch]);

    // Handle instant reset search
    const handleClearSearch = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setIsSearching(false);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    // Ambil kategori sekali saat mount
    useEffect(() => {
        let isMounted = true;
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.POSTS.CATEGORIES);
                if (isMounted && res.data?.success) {
                    setCategories(res.data.categories || []);
                }
            } catch (err) {
                console.error("Gagal memuat kategori:", err.message);
            }
        };

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    // Ambil daftar artikel admin saat parameter filter/pagination/refresh/debouncedSearch berubah
    useEffect(() => {
        let isMounted = true;
        const fetchAdminPosts = async () => {
            setLoading(true);
            try {
                let url = `${API_PATHS.POSTS.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`;

                if (selectedStatus === "published") {
                    url += "&status=published";
                } else if (selectedStatus === "draft") {
                    url += "&status=draft";
                } else {
                    url += "&status=all&includeDrafts=true";
                }

                if (selectedCategory && selectedCategory !== "all") {
                    url += `&category=${encodeURIComponent(selectedCategory)}`;
                }

                if (debouncedSearch) {
                    url += `&search=${encodeURIComponent(debouncedSearch)}`;
                }

                const response = await axiosInstance.get(url);
                if (isMounted && response.data?.success) {
                    setPosts(response.data.posts || []);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: response.data.pagination.totalPages || 1,
                        totalPosts: response.data.pagination.totalPosts || 0,
                    }));
                }
            } catch (err) {
                console.error("Gagal mengambil data artikel admin:", err.message);
                toast.error("Gagal memuat daftar artikel.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAdminPosts();
        return () => {
            isMounted = false;
        };
    }, [pagination.currentPage, pagination.limit, selectedStatus, selectedCategory, debouncedSearch, refreshTrigger]);

    const handleRefresh = () => {
        setLoading(true);
        setRefreshTrigger((prev) => prev + 1);
    };

    // Buka Modal Konfirmasi Hapus
    const handleDeleteClick = (post) => {
        setDeleteModal({
            isOpen: true,
            postId: post._id,
            postTitle: post.title,
            isDeleting: false,
        });
    };

    // Eksekusi Penghapusan Artikel
    const confirmDelete = async () => {
        if (!deleteModal.postId) return;

        setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
        try {
            const response = await axiosInstance.delete(API_PATHS.POSTS.DELETE(deleteModal.postId));
            if (response.data?.success) {
                toast.success(response.data.message || "Artikel berhasil dihapus.");
                setPosts((prev) => prev.filter((p) => p._id !== deleteModal.postId));
                setPagination((prev) => ({
                    ...prev,
                    totalPosts: Math.max(0, prev.totalPosts - 1),
                }));
                setDeleteModal({ isOpen: false, postId: null, postTitle: "", isDeleting: false });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghapus artikel.");
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    return (
        <DashboardLayout activeMenu="Blog Posts">
            <div className="space-y-6 pb-20">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Manajemen Artikel Blog
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Kelola, sunting, filter publikasi, atau buat artikel baru untuk platform Lingkaran Koding.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
                            title="Segarkan Data"
                        >
                            <LuRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            onClick={() => navigate("/admin/create")}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 hover:shadow-lg hover:shadow-sky-500/25 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                        >
                            <LuPlus className="text-base" />
                            <span>Tulis Artikel Baru</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">
                    {/* Search Input */}
                    <div className="flex-1 flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
                        {isSearching ? (
                            <LuLoader className="text-sky-500 text-sm shrink-0 animate-spin" />
                        ) : (
                            <LuSearch className="text-gray-400 dark:text-slate-500 text-sm shrink-0" />
                        )}
                        <input
                            type="text"
                            placeholder="Cari artikel berdasarkan judul, kategori, atau tag (misal: laravel)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-gray-800 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Hapus pencarian"
                            >
                                <LuX className="text-xs" />
                            </button>
                        )}
                    </div>

                    {/* Filter Status & Category */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Status Pills */}
                        <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                            {[
                                { id: "all", label: "Semua" },
                                { id: "published", label: "Terpublikasi" },
                                { id: "draft", label: "Draft" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setLoading(true);
                                        setSelectedStatus(tab.id);
                                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        selectedStatus === tab.id
                                            ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                                            : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Category Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setLoading(true);
                                setSelectedCategory(e.target.value);
                                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                            }}
                            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-slate-200 outline-none focus:border-sky-500 cursor-pointer"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name} ({c.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Posts Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
                    {loading ? (
                        <TableSkeleton rows={5} />
                    ) : posts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50/70 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3.5 px-4">Artikel</th>
                                        <th className="py-3.5 px-4">Kategori</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-center">Interaksi</th>
                                        <th className="py-3.5 px-4">Tanggal</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {posts.map((post) => (
                                        <tr key={post._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                                            {/* Title & Cover */}
                                            <td className="py-3.5 px-4 max-w-sm">
                                                <div className="flex items-center gap-3">
                                                    {post.coverImageUrl ? (
                                                        <img
                                                            src={post.coverImageUrl}
                                                            alt={post.title}
                                                            className="w-12 h-9 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs shrink-0 font-bold border border-sky-100 dark:border-sky-800/60">
                                                            LK
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <Link
                                                            to={`/${post.slug}`}
                                                            className="font-bold text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 truncate block text-xs md:text-sm transition-colors"
                                                            title={post.title}
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                                                            /{post.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                    {post.category || "General"}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {post.isDraft ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                        Draft
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Terpublikasi
                                                    </span>
                                                )}
                                            </td>

                                            {/* Stats Interactions */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1" title="Views">
                                                        <LuEye className="text-xs" />
                                                        {post.views || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1" title="Likes">
                                                        <LuHeart className="text-xs text-rose-500" />
                                                        {post.likeCount || (post.likes ? post.likes.length : 0)}
                                                    </span>
                                                    <span className="flex items-center gap-1" title="Comments">
                                                        <LuMessageSquare className="text-xs text-indigo-500" />
                                                        {post.commentCount || 0}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-slate-400 text-[11px]">
                                                {formatDate(post.createdAt)}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        to={`/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                                                        title="Lihat Pratinjau Publik"
                                                    >
                                                        <LuExternalLink className="text-sm" />
                                                    </Link>

                                                    <button
                                                        onClick={() => navigate(`/admin/edit/${post.slug}`)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                        title="Edit Artikel"
                                                    >
                                                        <LuPencil className="text-sm" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteClick(post)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                        title="Hapus Artikel"
                                                    >
                                                        <LuTrash2 className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="py-16 text-center space-y-3">
                            <div className="w-14 h-14 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-sky-100 dark:border-sky-800/40">
                                <LuFileText />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                                {debouncedSearch
                                    ? `Tidak ada artikel untuk "${debouncedSearch}"`
                                    : selectedStatus === "draft"
                                    ? "Data draft belum ada saat ini"
                                    : selectedStatus === "published"
                                    ? "Belum ada artikel terpublikasi"
                                    : "Tidak ada artikel ditemukan"}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
                                {debouncedSearch
                                    ? `Tidak ditemukan artikel yang cocok dengan kata kunci "${debouncedSearch}". Coba kata kunci lain atau bersihkan pencarian.`
                                    : selectedStatus === "draft"
                                    ? "Anda belum memiliki artikel yang berstatus draft. Tulis artikel baru dan simpan sebagai draft jika belum ingin mempublikasikannya."
                                    : selectedStatus === "published"
                                    ? "Belum ada artikel yang dipublikasikan. Tulis artikel baru atau publikasikan artikel dari status draft."
                                    : "Coba ubah kata kunci pencarian, filter kategori, atau buat artikel baru sekarang."}
                            </p>
                            {debouncedSearch ? (
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
                                    >
                                        <LuX className="text-xs" />
                                        <span>Reset Pencarian</span>
                                    </button>
                                </div>
                            ) : selectedStatus === "draft" ? (
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/25 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                                    >
                                        <LuPlus className="text-base" />
                                        <span>Buat Draft Baru</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                                Menampilkan halaman {pagination.currentPage} dari {pagination.totalPages} ({pagination.totalPosts} total artikel)
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    disabled={pagination.currentPage <= 1}
                                    onClick={() => {
                                        setLoading(true);
                                        setPagination((prev) => ({
                                            ...prev,
                                            currentPage: prev.currentPage - 1,
                                        }));
                                    }}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <LuChevronLeft className="text-sm" />
                                </button>
                                <button
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    onClick={() => {
                                        setLoading(true);
                                        setPagination((prev) => ({
                                            ...prev,
                                            currentPage: prev.currentPage + 1,
                                        }));
                                    }}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <LuChevronRight className="text-sm" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center text-xl border border-red-100 dark:border-red-800/40">
                            <LuTrash2 />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Konfirmasi Hapus Artikel
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                Apakah Anda yakin ingin menghapus artikel{" "}
                                <span className="font-bold text-gray-800 dark:text-slate-200">&ldquo;{deleteModal.postTitle}&rdquo;</span>?
                                Semua komentar yang terhubung dengan artikel ini juga akan ikut dihapus secara permanen.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={deleteModal.isDeleting}
                                onClick={() => setDeleteModal({ isOpen: false, postId: null, postTitle: "", isDeleting: false })}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={deleteModal.isDeleting}
                                onClick={confirmDelete}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
                            >
                                {deleteModal.isDeleting ? "Menghapus..." : "Ya, Hapus Artikel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BlogPosts;
