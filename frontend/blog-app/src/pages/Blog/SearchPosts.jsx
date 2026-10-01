import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import BlogPostCard from "../../components/Cards/BlogPostCard";
import { CardSkeleton } from "../../components/Common/SkeletonLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuSearch, LuX, LuChevronLeft, LuChevronRight, LuSparkles } from "react-icons/lu";

const SearchPosts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const queryFromUrl = searchParams.get("q") || "";
    const [keyword, setKeyword] = useState(queryFromUrl);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(Boolean(queryFromUrl));

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        limit: 9,
    });

    // Sesuaikan keyword state jika query di URL berubah dari navigasi luar (misal: hero / navbar)
    const [prevQuery, setPrevQuery] = useState(queryFromUrl);
    if (queryFromUrl !== prevQuery) {
        setPrevQuery(queryFromUrl);
        setKeyword(queryFromUrl);
    }

    // Jalankan pencarian saat query URL atau pagination berubah
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!queryFromUrl.trim()) {
                setPosts([]);
                setHasSearched(false);
                setPagination((prev) => ({ ...prev, totalPosts: 0, totalPages: 1 }));
                return;
            }

            setLoading(true);
            setHasSearched(true);
            try {
                const response = await axiosInstance.get(
                    `${API_PATHS.POSTS.SEARCH}?q=${encodeURIComponent(queryFromUrl.trim())}&page=${pagination.currentPage}&limit=${pagination.limit}`
                );

                if (response.data?.success) {
                    setPosts(response.data.posts || []);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: response.data.pagination.totalPages || 1,
                        totalPosts: response.data.pagination.totalPosts || 0,
                    }));
                }
            } catch (err) {
                console.error("Gagal melakukan pencarian artikel:", err.message);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [queryFromUrl, pagination.currentPage, pagination.limit]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = keyword.trim();
        if (trimmed) {
            setSearchParams({ q: trimmed });
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
        } else {
            setSearchParams({});
            setPosts([]);
            setHasSearched(false);
        }
    };

    const handleClear = () => {
        setKeyword("");
        setSearchParams({});
        setPosts([]);
        setHasSearched(false);
    };

    const handleQuickKeyword = (tag) => {
        setKeyword(tag);
        setSearchParams({ q: tag });
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    return (
        <BlogLayout activeMenu="Search">
            <div className="space-y-10 pb-16">
                {/* Search Header Banner */}
                <section className="bg-linear-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-950 border border-sky-100/60 dark:border-slate-800 rounded-3xl p-6 md:p-12 text-center space-y-5 shadow-xs transition-colors">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
                        <LuSparkles className="text-sm" /> Eksplorasi Pengetahuan
                    </div>

                    <div className="space-y-2 max-w-xl mx-auto">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Pencarian Artikel & Materi
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">
                            Temukan tutorial, panduan teknologi, tips AI, dan arsitektur kode dengan cepat.
                        </p>
                    </div>

                    {/* Search Bar Form */}
                    <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
                        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-md p-1.5 focus-within:border-sky-500 focus-within:ring-3 focus-within:ring-sky-500/15 transition-all">
                            <div className="flex-1 flex items-center gap-3 pl-3.5 pr-2">
                                <LuSearch className="text-gray-400 dark:text-slate-500 text-xl shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Ketik kata kunci (contoh: React, JWT, Express, TypeScript)..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full text-sm text-gray-800 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500 py-1.5 bg-transparent"
                                    autoFocus
                                />
                                {keyword && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                        title="Hapus pencarian"
                                    >
                                        <LuX className="text-base" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="bg-sky-500 hover:bg-sky-600 text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer shrink-0"
                            >
                                Cari
                            </button>
                        </div>
                    </form>

                    {/* Quick Search Suggestions */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span>Pencarian populer:</span>
                        {["MERN", "Authentication", "Tailwind", "Artificial Intelligence", "Next.js", "Docker"].map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => handleQuickKeyword(item)}
                                className="bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg transition-colors cursor-pointer text-xs"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Results Section */}
                <section className="space-y-6">
                    {/* Header info */}
                    {hasSearched && (
                        <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-slate-800 pb-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                                    Hasil Pencarian untuk:{" "}
                                    <span className="text-sky-600 dark:text-sky-400 font-extrabold">&ldquo;{queryFromUrl}&rdquo;</span>
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                    {loading
                                        ? "Sedang memuat hasil..."
                                        : `Ditemukan ${pagination.totalPosts} artikel yang sesuai`}
                                </p>
                            </div>

                            {queryFromUrl && (
                                <button
                                    onClick={handleClear}
                                    className="text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 underline cursor-pointer"
                                >
                                    Reset Hasil
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content Display: Loading, Empty, or Results */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : hasSearched && posts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <BlogPostCard key={post._id} post={post} />
                            ))}
                        </div>
                    ) : hasSearched && posts.length === 0 ? (
                        /* Empty State Saat Pencarian Tidak Ditemukan */
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 space-y-4">
                            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-amber-200/50 dark:border-amber-800/40">
                                🔍
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Tidak ada artikel yang cocok
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Tidak ditemukan artikel dengan kata kunci &ldquo;{queryFromUrl}&rdquo;. Coba periksa ejaan atau gunakan kata kunci umum lainnya.
                                </p>
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate("/")}
                                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-5 py-2.5 rounded-xl transition-colors cursor-pointer border border-sky-100 dark:border-sky-800/40"
                                >
                                    Lihat Semua Artikel di Beranda
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Idle State Saat Belum Mencari */
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 space-y-3">
                            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-sky-100 dark:border-sky-800/40">
                                💡
                            </div>
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">
                                Mulai Menjelajahi Artikel
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                                Masukkan kata kunci di atas untuk mencari artikel berdasarkan judul, kategori, konten, atau topik tertentu.
                            </p>
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <button
                                disabled={pagination.currentPage <= 1}
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        currentPage: prev.currentPage - 1,
                                    }))
                                }
                                className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <LuChevronLeft className="text-base" />
                            </button>

                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 px-4">
                                Halaman {pagination.currentPage} dari {pagination.totalPages}
                            </span>

                            <button
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        currentPage: prev.currentPage + 1,
                                    }))
                                }
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

export default SearchPosts;
