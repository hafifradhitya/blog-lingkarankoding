import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import BlogPostCard from "../../components/Cards/BlogPostCard";
import { CardSkeleton } from "../../components/Common/SkeletonLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuSearch, LuTrendingUp, LuFlame, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const BlogLandingPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryCategory = searchParams.get("category");

    const [posts, setPosts] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const selectedCategory = queryCategory || "All";
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        limit: 9,
    });

    // Ambil daftar artikel trending dan kategori sekali saat load
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [trendingRes, categoriesRes] = await Promise.all([
                    axiosInstance.get(API_PATHS.POSTS.TRENDING + "?limit=4"),
                    axiosInstance.get(API_PATHS.POSTS.CATEGORIES),
                ]);

                if (trendingRes.data?.success) {
                    setTrendingPosts(trendingRes.data.posts || []);
                }
                if (categoriesRes.data?.success) {
                    setCategories(categoriesRes.data.categories || []);
                }
            } catch (err) {
                console.error("Gagal mengambil data trending/kategori:", err.message);
            }
        };

        fetchInitialData();
    }, []);

    // Ambil daftar artikel sesuai kategori & pagination
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let url = `${API_PATHS.POSTS.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`;
                if (selectedCategory && selectedCategory !== "All" && selectedCategory !== "Semua") {
                    url += `&category=${encodeURIComponent(selectedCategory)}`;
                }

                const response = await axiosInstance.get(url);
                if (response.data?.success) {
                    setPosts(response.data.posts || []);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: response.data.pagination.totalPages || 1,
                        totalPosts: response.data.pagination.totalPosts || 0,
                    }));
                }
            } catch (err) {
                console.error("Gagal mengambil artikel:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [selectedCategory, pagination.currentPage, pagination.limit]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleCategoryClick = (categoryName) => {
        setLoading(true);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        if (categoryName === "All" || categoryName === "Semua") {
            setSearchParams({});
        } else {
            setSearchParams({ category: categoryName });
        }
    };

    return (
        <BlogLayout activeMenu={selectedCategory === "All" || selectedCategory === "Semua" ? "Semua" : selectedCategory}>
            <div className="space-y-12 pb-16">
                {/* 1. Hero Section */}
                <section className="relative rounded-3xl bg-linear-to-r from-sky-500 via-sky-600 to-cyan-500 p-8 md:p-14 text-white shadow-xl shadow-sky-500/15 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl space-y-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-white">
                            <LuFlame className="text-amber-300" /> Lingkaran Koding Blog
                        </span>

                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Eksplorasi Coding & Integrasi Gemini AI
                        </h1>

                        <p className="text-sm md:text-base text-sky-100 font-normal leading-relaxed">
                            Pelajari artikel praktis seputar Web Development, Node.js, React, arsitektur backend scalable, dan integrasi Artificial Intelligence generasi terbaru.
                        </p>

                        {/* Search Input Bar in Hero */}
                        <form onSubmit={handleSearchSubmit} className="pt-2">
                            <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-lg max-w-lg border border-transparent dark:border-slate-700/80 transition-colors">
                                <div className="flex-1 flex items-center gap-3 px-3">
                                    <LuSearch className="text-gray-400 dark:text-slate-400 text-lg" />
                                    <input
                                        type="text"
                                        placeholder="Cari tutorial, topik, teknologi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent text-sm text-gray-800 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>

                        {/* Quick Tags Badge */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-sky-100">
                            <span className="opacity-80">Populer:</span>
                            {["React", "Next.js", "Node.js", "AI", "MongoDB"].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => navigate(`/tag/${tag}`)}
                                    className="bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. Trending Section */}
                {trendingPosts.length > 0 && (
                    <section className="space-y-5">
                        <div className="flex items-center gap-2">
                            <LuTrendingUp className="text-xl text-sky-500" />
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                Artikel Trending
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {trendingPosts.map((post) => (
                                <BlogPostCard key={post._id} post={post} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Category Filter Tabs */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-slate-800 pb-4 flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                Semua Artikel
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                Menampilkan {pagination.totalPosts} artikel yang dipublikasikan
                            </p>
                        </div>

                        {/* Categories Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                            <button
                                onClick={() => handleCategoryClick("All")}
                                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                                    selectedCategory === "All" || selectedCategory === "Semua"
                                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                                        : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-800"
                                }`}
                            >
                                Semua Kategori
                            </button>

                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                                        selectedCategory?.toLowerCase() === cat.name.toLowerCase()
                                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                                            : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-800"
                                    }`}
                                >
                                    {cat.name} ({cat.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Posts Grid / Loading State / Empty State */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <BlogPostCard key={post._id} post={post} />
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8">
                            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                                📝
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Belum Ada Artikel</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                Belum ada artikel untuk kategori ini. Silakan pilih kategori lain atau kembali ke semua kategori.
                            </p>
                            <button
                                onClick={() => handleCategoryClick("All")}
                                className="mt-4 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-sky-100 dark:border-sky-800/40"
                            >
                                Kembali ke Semua Kategori
                            </button>
                        </div>
                    )}

                    {/* 5. Pagination Bar */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <button
                                disabled={pagination.currentPage <= 1}
                                onClick={() => {
                                    setLoading(true);
                                    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
                                }}
                                className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <LuChevronLeft className="text-base" />
                            </button>

                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 px-4">
                                Halaman {pagination.currentPage} dari {pagination.totalPages}
                            </span>

                            <button
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() => {
                                    setLoading(true);
                                    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
                                }}
                                className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <LuChevronRight className="text-base" />
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </BlogLayout>
    );
};

export default BlogLandingPage;
