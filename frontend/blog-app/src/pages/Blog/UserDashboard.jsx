import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LuBookmark,
    LuHeart,
    LuMessageSquare,
    LuSettings,
    LuUser,
    LuMail,
    LuCalendar,
    LuArrowRight,
    LuLock,
    LuSave,
    LuLoader,
    LuCircleCheck,
    LuExternalLink,
    LuSparkles,
    LuCompass,
} from "react-icons/lu";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import { useUser } from "../../context/userContext";
import CharAvatar from "../../components/Cards/CharAvatar";
import BlogPostCard from "../../components/Cards/BlogPostCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate, getValidImageUrl } from "../../utils/helper";
import toast from "react-hot-toast";

const UserDashboard = () => {
    const { user, updateUser } = useUser();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("bookmarks"); // "bookmarks" | "liked" | "comments" | "settings"

    // Data States
    const [stats, setStats] = useState({
        totalBookmarks: 0,
        totalLikedPosts: 0,
        totalUserComments: 0,
    });
    const [bookmarks, setBookmarks] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [myComments, setMyComments] = useState([]);

    // Loading States
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingBookmarks, setLoadingBookmarks] = useState(false);
    const [loadingLiked, setLoadingLiked] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    // Profile Settings Form State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        bio: user?.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [savingProfile, setSavingProfile] = useState(false);

    // Muat ringkasan statistik user dashboard
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoadingSummary(true);
                const res = await axiosInstance.get(API_PATHS.DASHBOARD.USER_SUMMARY);
                if (res.data?.success && res.data.summary) {
                    setStats({
                        totalBookmarks: res.data.summary.totalBookmarks || 0,
                        totalLikedPosts: res.data.summary.totalLikedPosts || 0,
                        totalUserComments: res.data.summary.totalUserComments || 0,
                    });
                }
            } catch (err) {
                console.error("Gagal memuat ringkasan user:", err);
            } finally {
                setLoadingSummary(false);
            }
        };

        fetchSummary();
    }, []);

    // Muat data spesifik berdasarkan tab yang aktif
    useEffect(() => {
        if (activeTab === "bookmarks") {
            const fetchBookmarks = async () => {
                try {
                    setLoadingBookmarks(true);
                    const res = await axiosInstance.get(API_PATHS.POSTS.BOOKMARKS);
                    if (res.data?.success) {
                        setBookmarks(res.data.posts || []);
                        setStats((prev) => ({
                            ...prev,
                            totalBookmarks: (res.data.posts || []).length,
                        }));
                    }
                } catch (err) {
                    console.error("Gagal mengambil daftar bookmark:", err);
                    toast.error("Gagal memuat artikel tersimpan.");
                } finally {
                    setLoadingBookmarks(false);
                }
            };
            fetchBookmarks();
        } else if (activeTab === "liked") {
            const fetchLiked = async () => {
                try {
                    setLoadingLiked(true);
                    const res = await axiosInstance.get(API_PATHS.POSTS.LIKED);
                    if (res.data?.success) {
                        setLikedPosts(res.data.posts || []);
                        setStats((prev) => ({
                            ...prev,
                            totalLikedPosts: (res.data.posts || []).length,
                        }));
                    }
                } catch (err) {
                    console.error("Gagal mengambil daftar liked posts:", err);
                    toast.error("Gagal memuat artikel yang disukai.");
                } finally {
                    setLoadingLiked(false);
                }
            };
            fetchLiked();
        } else if (activeTab === "comments") {
            const fetchComments = async () => {
                try {
                    setLoadingComments(true);
                    const res = await axiosInstance.get(API_PATHS.COMMENTS.MY_COMMENTS);
                    if (res.data?.success) {
                        setMyComments(res.data.comments || []);
                        setStats((prev) => ({
                            ...prev,
                            totalUserComments: (res.data.comments || []).length,
                        }));
                    }
                } catch (err) {
                    console.error("Gagal mengambil daftar komentar saya:", err);
                    toast.error("Gagal memuat riwayat komentar.");
                } finally {
                    setLoadingComments(false);
                }
            };
            fetchComments();
        }
    }, [activeTab]);

    // Handle Simpan Profil & Ganti Password
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!profileForm.name.trim()) {
            toast.error("Nama lengkap tidak boleh kosong.");
            return;
        }

        if (profileForm.newPassword) {
            if (!profileForm.currentPassword) {
                toast.error("Password saat ini wajib diisi jika ingin mengganti password baru.");
                return;
            }
            if (profileForm.newPassword.length < 6) {
                toast.error("Password baru minimal 6 karakter.");
                return;
            }
            if (profileForm.newPassword !== profileForm.confirmPassword) {
                toast.error("Konfirmasi password baru tidak cocok.");
                return;
            }
        }

        try {
            setSavingProfile(true);
            const payload = {
                name: profileForm.name.trim(),
                bio: profileForm.bio.trim(),
            };

            if (profileForm.newPassword) {
                payload.currentPassword = profileForm.currentPassword;
                payload.newPassword = profileForm.newPassword;
            }

            const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, payload);
            if (res.data?.success && res.data.user) {
                updateUser(res.data.user);
                toast.success("Profil Anda berhasil diperbarui!");
                setProfileForm((prev) => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }));
            }
        } catch (err) {
            const msg =
                err.response?.data?.message || "Gagal memperbarui profil. Silakan coba lagi.";
            toast.error(msg);
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <BlogLayout activeMenu="Dashboard Saya">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                {/* 1. Identity Hero Card */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200/70 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden transition-colors">
                    {/* Top Decorative Subtle Line */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-sky-500 via-indigo-500 to-cyan-500"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {user?.profileImageUrl ? (
                                <img
                                    src={getValidImageUrl(user.profileImageUrl)}
                                    alt={user.name}
                                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800 ring-2 ring-sky-500/30"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="ring-2 ring-sky-500/30 rounded-2xl overflow-hidden shadow-md">
                                    <CharAvatar
                                        fullName={user?.name || "Member"}
                                        width="w-16 md:w-20"
                                        height="h-16 md:h-20"
                                        style="text-xl md:text-2xl font-bold"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex items-center flex-wrap gap-2.5">
                                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        {user?.name}
                                    </h1>
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60">
                                        {user?.role === "admin" ? "Admin Platform" : "Member Lingkaran Koding"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <LuMail className="text-sky-500" />
                                        {user?.email}
                                    </span>
                                    {user?.createdAt && (
                                        <span className="flex items-center gap-1.5">
                                            <LuCalendar className="text-indigo-500" />
                                            Bergabung: {formatDate(user.createdAt)}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300 pt-1 max-w-xl line-clamp-2">
                                    {user?.bio || (
                                        <span className="italic text-gray-400 dark:text-slate-500">
                                            Belum ada bio singkat. Klik tombol Edit Profil untuk menambahkan bio Anda.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Edit Profile CTA Button */}
                        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab("settings")}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-gray-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                            >
                                <LuSettings className="text-sm" />
                                <span>Edit Profil</span>
                            </button>
                        </div>
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 md:gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                        {/* Bookmark Metric */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("bookmarks")}
                            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                                activeTab === "bookmarks"
                                    ? "bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800/80 shadow-xs"
                                    : "bg-gray-50/70 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 hover:bg-sky-50/40 dark:hover:bg-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                                    Artikel Disimpan
                                </span>
                                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    <LuBookmark className="text-base" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                {loadingSummary ? "..." : stats.totalBookmarks}
                            </p>
                        </button>

                        {/* Liked Metric */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("liked")}
                            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                                activeTab === "liked"
                                    ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 shadow-xs"
                                    : "bg-gray-50/70 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 hover:bg-rose-50/40 dark:hover:bg-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                                    Artikel Disukai
                                </span>
                                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                    <LuHeart className="text-base" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                {loadingSummary ? "..." : stats.totalLikedPosts}
                            </p>
                        </button>

                        {/* Comments Metric */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("comments")}
                            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                                activeTab === "comments"
                                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/80 shadow-xs"
                                    : "bg-gray-50/70 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 hover:bg-indigo-50/40 dark:hover:bg-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                                    Komentar Saya
                                </span>
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <LuMessageSquare className="text-base" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                {loadingSummary ? "..." : stats.totalUserComments}
                            </p>
                        </button>
                    </div>
                </div>

                {/* 2. Interactive Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveTab("bookmarks")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === "bookmarks"
                                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <LuBookmark className="text-base" />
                        <span>Artikel Disimpan ({stats.totalBookmarks})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("liked")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === "liked"
                                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <LuHeart className="text-base" />
                        <span>Disukai ({stats.totalLikedPosts})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("comments")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === "comments"
                                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <LuMessageSquare className="text-base" />
                        <span>Komentar Saya ({stats.totalUserComments})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("settings")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === "settings"
                                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <LuSettings className="text-base" />
                        <span>Pengaturan Akun</span>
                    </button>
                </div>

                {/* 3. Tab Contents Area */}
                <div>
                    {/* TAB 1: ARTIKEL DISIMPAN (BOOKMARKS) */}
                    {activeTab === "bookmarks" && (
                        <div className="space-y-6">
                            {loadingBookmarks ? (
                                <div className="py-20 flex flex-col items-center justify-center text-sky-500">
                                    <LuLoader className="text-3xl animate-spin" />
                                    <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-slate-400">
                                        Memuat artikel tersimpan...
                                    </p>
                                </div>
                            ) : bookmarks.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-3">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center text-2xl shadow-inner">
                                        <LuBookmark />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Belum Ada Artikel yang Disimpan
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                                        Temukan tutorial atau artikel menarik di Lingkaran Koding, lalu klik ikon bookmark untuk menyimpannya ke daftar bacaan Anda.
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            to="/"
                                            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                                        >
                                            <LuCompass className="text-sm" />
                                            <span>Jelajahi Artikel Sekarang</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bookmarks.map((post) => (
                                        <BlogPostCard key={post._id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: ARTIKEL DISUKAI (LIKED POSTS) */}
                    {activeTab === "liked" && (
                        <div className="space-y-6">
                            {loadingLiked ? (
                                <div className="py-20 flex flex-col items-center justify-center text-rose-500">
                                    <LuLoader className="text-3xl animate-spin" />
                                    <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-slate-400">
                                        Memuat artikel yang disukai...
                                    </p>
                                </div>
                            ) : likedPosts.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-3">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center text-2xl shadow-inner">
                                        <LuHeart />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Belum Ada Artikel yang Disukai
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                                        Beri apresiasi like pada tutorial dan artikel yang bermanfaat agar tersimpan di riwayat favorit Anda.
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            to="/"
                                            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                                        >
                                            <LuCompass className="text-sm" />
                                            <span>Temukan Artikel Menarik</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {likedPosts.map((post) => (
                                        <BlogPostCard key={post._id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: KOMENTAR SAYA (MY COMMENTS) */}
                    {activeTab === "comments" && (
                        <div className="space-y-4">
                            {loadingComments ? (
                                <div className="py-20 flex flex-col items-center justify-center text-indigo-500">
                                    <LuLoader className="text-3xl animate-spin" />
                                    <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-slate-400">
                                        Memuat riwayat komentar...
                                    </p>
                                </div>
                            ) : myComments.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-3">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center text-2xl shadow-inner">
                                        <LuMessageSquare />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Belum Ada Komentar Ditulis
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                                        Mulai berdiskusi, bertanya teknis, atau membagikan insight di kolom komentar setiap artikel.
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            to="/"
                                            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                                        >
                                            <LuCompass className="text-sm" />
                                            <span>Mulai Baca Artikel</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myComments.map((comment) => (
                                        <div
                                            key={comment._id}
                                            className="bg-white dark:bg-slate-900 border border-gray-200/70 dark:border-slate-800 rounded-2xl p-5 transition-all hover:border-sky-300 dark:hover:border-sky-800 shadow-2xs space-y-3"
                                        >
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60">
                                                        {comment.post?.category || "Artikel"}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-slate-500">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>

                                                {comment.post?.slug && (
                                                    <Link
                                                        to={`/${comment.post.slug}`}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                                                    >
                                                        <span>Lihat Artikel</span>
                                                        <LuExternalLink className="text-xs" />
                                                    </Link>
                                                )}
                                            </div>

                                            {comment.post?.title && (
                                                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                                                    Pada artikel:{" "}
                                                    <span className="text-gray-900 dark:text-white font-bold">
                                                        "{comment.post.title}"
                                                    </span>
                                                </p>
                                            )}

                                            <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-gray-100 dark:border-slate-800 text-xs md:text-sm text-gray-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                {comment.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: PENGATURAN PROFIL & AKUN (SETTINGS) */}
                    {activeTab === "settings" && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200/70 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs max-w-2xl transition-colors">
                            <div className="pb-5 border-b border-gray-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Pengaturan Profil & Akun
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                    Perbarui informasi profil atau perbarui kata sandi akun Anda.
                                </p>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-5 pt-6">
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
                                        <LuUser className="text-gray-400 dark:text-slate-400 text-base shrink-0" />
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, name: e.target.value })
                                            }
                                            placeholder="Masukkan nama lengkap Anda"
                                            className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email (Read-Only) */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                                        Alamat Email
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed">
                                        <LuMail className="text-base shrink-0" />
                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="w-full bg-transparent outline-none cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                                        Alamat email terdaftar dan tidak dapat diubah secara langsung demi keamanan akun.
                                    </p>
                                </div>

                                {/* Bio Singkat */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                                        Bio Singkat
                                    </label>
                                    <textarea
                                        value={profileForm.bio}
                                        onChange={(e) =>
                                            setProfileForm({ ...profileForm, bio: e.target.value })
                                        }
                                        placeholder="Tulis sedikit tentang diri Anda, minat teknologi, atau peran Anda..."
                                        rows={3}
                                        maxLength={250}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-xs md:text-sm text-gray-800 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                                    />
                                    <div className="flex justify-end text-[11px] text-gray-400 dark:text-slate-500">
                                        <span>{profileForm.bio.length} / 250 karakter</span>
                                    </div>
                                </div>

                                {/* Ganti Password Section */}
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                                            <LuLock className="text-sky-500" />
                                            <span>Ganti Kata Sandi (Opsional)</span>
                                        </h4>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                                            Biarkan kosong jika Anda tidak bermaksud mengubah kata sandi.
                                        </p>
                                    </div>

                                    {/* Password Saat Ini */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                            Kata Sandi Saat Ini
                                        </label>
                                        <input
                                            type="password"
                                            value={profileForm.currentPassword}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    currentPassword: e.target.value,
                                                })
                                            }
                                            placeholder="Masukkan kata sandi saat ini"
                                            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-gray-800 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Password Baru */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                                Kata Sandi Baru
                                            </label>
                                            <input
                                                type="password"
                                                value={profileForm.newPassword}
                                                onChange={(e) =>
                                                    setProfileForm({
                                                        ...profileForm,
                                                        newPassword: e.target.value,
                                                    })
                                                }
                                                placeholder="Minimal 6 karakter"
                                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-gray-800 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                                            />
                                        </div>

                                        {/* Konfirmasi Password Baru */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                                Konfirmasi Kata Sandi Baru
                                            </label>
                                            <input
                                                type="password"
                                                value={profileForm.confirmPassword}
                                                onChange={(e) =>
                                                    setProfileForm({
                                                        ...profileForm,
                                                        confirmPassword: e.target.value,
                                                    })
                                                }
                                                placeholder="Ulangi kata sandi baru"
                                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-gray-800 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Simpan */}
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                                    >
                                        {savingProfile ? (
                                            <>
                                                <LuLoader className="animate-spin text-base" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LuSave className="text-base" />
                                                <span>Simpan Perubahan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </BlogLayout>
    );
};

export default UserDashboard;
