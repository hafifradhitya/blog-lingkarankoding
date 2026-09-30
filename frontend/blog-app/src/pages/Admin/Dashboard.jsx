import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import CharAvatar from "../../components/Cards/CharAvatar";
import { MetricCardSkeleton, TableSkeleton } from "../../components/Common/SkeletonLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate } from "../../utils/helper";
import {
    LuFileText,
    LuEye,
    LuHeart,
    LuMessageSquare,
    LuUsers,
    LuPlus,
    LuExternalLink,
    LuPencil,
    LuArrowRight,
    LuRefreshCw,
    LuFolderTree,
} from "react-icons/lu";

const Dashboard = () => {
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.DASHBOARD.ADMIN_SUMMARY);
            if (response.data?.success) {
                setSummary(response.data.summary);
                setCategoryDistribution(response.data.categoryDistribution || []);
                setRecentPosts(response.data.recentPosts || []);
                setRecentUsers(response.data.recentUsers || []);
            }
        } catch (err) {
            console.error("Gagal mengambil data dashboard:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        loadDashboardData();
    };

    useEffect(() => {
        let isMounted = true;
        const loadInitial = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.DASHBOARD.ADMIN_SUMMARY);
                if (isMounted && response.data?.success) {
                    setSummary(response.data.summary);
                    setCategoryDistribution(response.data.categoryDistribution || []);
                    setRecentPosts(response.data.recentPosts || []);
                    setRecentUsers(response.data.recentUsers || []);
                }
            } catch (err) {
                console.error("Gagal mengambil data dashboard:", err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadInitial();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="space-y-8 pb-16">
                {/* Dashboard Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Ringkasan Analitik Platform
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Pantau performa konten blog, interaksi pembaca, dan aktivitas pengguna secara real-time.
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

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <MetricCardSkeleton key={i} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                                <TableSkeleton rows={4} />
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 space-y-4 animate-pulse">
                                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 1. Stat Metric Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Card 1: Total Posts */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between hover:border-sky-300 dark:hover:border-sky-500 transition-colors">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                        Total Artikel
                                    </span>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {summary?.totalPosts || 0}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                            {summary?.totalPublished || 0} Publish
                                        </span>
                                        <span>•</span>
                                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                            {summary?.totalDrafts || 0} Draft
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shrink-0 border border-sky-100 dark:border-sky-800/50">
                                    <LuFileText />
                                </div>
                            </div>

                            {/* Card 2: Total Views */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                        Total Pembaca
                                    </span>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {(summary?.totalViews || 0).toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500">Total views artikel terakumulasi</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                                    <LuEye />
                                </div>
                            </div>

                            {/* Card 3: Total Likes & Comments */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between hover:border-rose-300 dark:hover:border-rose-500 transition-colors">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                        Interaksi Suka & Komen
                                    </span>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {(summary?.totalLikes || 0) + (summary?.totalComments || 0)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400">
                                        <span className="text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1">
                                            <LuHeart className="text-xs" /> {summary?.totalLikes || 0} Suka
                                        </span>
                                        <span>•</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                            <LuMessageSquare className="text-xs" /> {summary?.totalComments || 0} Diskusi
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center text-xl shrink-0 border border-rose-100 dark:border-rose-800/50">
                                    <LuHeart />
                                </div>
                            </div>

                            {/* Card 4: Total Users */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                        Total Pengguna
                                    </span>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {summary?.totalUsers || 0}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400">
                                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                            {summary?.totalMembers || 0} Member
                                        </span>
                                        <span>•</span>
                                        <span className="text-sky-600 dark:text-sky-400 font-semibold">
                                            {summary?.totalAdmins || 0} Admin
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0 border border-purple-100 dark:border-purple-800/50">
                                    <LuUsers />
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Content Split: Recent Posts Table & Category Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Recent Posts Table (2 cols) */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Artikel Terbaru</h3>
                                        <p className="text-xs text-gray-400 dark:text-slate-400">
                                            5 artikel terakhir yang dibuat di platform
                                        </p>
                                    </div>
                                    <Link
                                        to="/admin/posts"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                                    >
                                        <span>Lihat Semua</span>
                                        <LuArrowRight className="text-xs" />
                                    </Link>
                                </div>

                                {recentPosts.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800 font-semibold">
                                                    <th className="pb-3">Judul Artikel</th>
                                                    <th className="pb-3">Kategori</th>
                                                    <th className="pb-3">Status</th>
                                                    <th className="pb-3 text-center">Views</th>
                                                    <th className="pb-3 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                {recentPosts.map((post) => (
                                                    <tr key={post._id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="py-3 pr-3 font-semibold text-gray-800 dark:text-slate-200 max-w-xs truncate">
                                                            <Link
                                                                to={`/${post.slug}`}
                                                                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                                            >
                                                                {post.title}
                                                            </Link>
                                                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
                                                                {formatDate(post.createdAt)} • Oleh {post.author?.name || "Penulis"}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 pr-3">
                                                            <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                                {post.category || "General"}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 pr-3">
                                                            {post.isDraft ? (
                                                                <span className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                    Draft
                                                                </span>
                                                            ) : (
                                                                <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                    Terbit
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-center text-gray-600 dark:text-slate-400 font-medium">
                                                            {post.views || 0}
                                                        </td>
                                                        <td className="py-3 text-right space-x-1">
                                                            <button
                                                                onClick={() => navigate(`/admin/edit/${post.slug}`)}
                                                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                                title="Edit Artikel"
                                                            >
                                                                <LuPencil className="text-sm" />
                                                            </button>
                                                            <Link
                                                                to={`/${post.slug}`}
                                                                className="inline-block p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                                title="Lihat Artikel"
                                                            >
                                                                <LuExternalLink className="text-sm" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                                        Belum ada artikel yang dibuat.
                                    </div>
                                )}
                            </div>

                            {/* Right: Category Distribution & Quick Links (1 col) */}
                            <div className="space-y-6">
                                {/* Distribusi Kategori */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                                        <LuFolderTree className="text-sky-500 text-base" />
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            Distribusi Kategori
                                        </h3>
                                    </div>

                                    {categoryDistribution.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {categoryDistribution.map((cat, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <span className="font-semibold text-gray-700 dark:text-slate-300">
                                                        {cat.category || "General"}
                                                    </span>
                                                    <span className="text-[11px] font-bold bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg text-sky-600 dark:text-sky-400 shadow-2xs border border-gray-100 dark:border-slate-700">
                                                        {cat.count} artikel
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-slate-500 py-3 text-center">
                                            Belum ada data kategori.
                                        </p>
                                    )}
                                </div>

                                {/* User Baru Terdaftar */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                                        <LuUsers className="text-purple-500 text-base" />
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            Pengguna Terbaru
                                        </h3>
                                    </div>

                                    {recentUsers.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentUsers.map((u) => (
                                                <div
                                                    key={u._id}
                                                    className="flex items-center justify-between gap-3 text-xs"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        {u.profileImageUrl ? (
                                                            <img
                                                                src={u.profileImageUrl}
                                                                alt={u.name}
                                                                className="w-7 h-7 rounded-full object-cover shrink-0"
                                                            />
                                                        ) : (
                                                            <CharAvatar
                                                                fullName={u.name}
                                                                width="w-7"
                                                                height="h-7"
                                                                style="text-[9px]"
                                                            />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 dark:text-white truncate">
                                                                {u.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                                                                {u.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                                            u.role === "admin"
                                                                ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                                                                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                                                        }`}
                                                    >
                                                        {u.role}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-slate-500 py-3 text-center">
                                            Belum ada pengguna.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
