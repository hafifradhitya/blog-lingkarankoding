import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import BlogPostCard from "../../components/Cards/BlogPostCard";
import { CardSkeleton } from "../../components/Common/SkeletonLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuTag, LuChevronLeft, LuChevronRight, LuArrowLeft } from "react-icons/lu";

const PostByTags = () => {
    const { tagName } = useParams();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        limit: 9,
    });

    useEffect(() => {
        const fetchPostsByTag = async () => {
            if (!tagName) return;

            setLoading(true);
            try {
                const response = await axiosInstance.get(
                    `${API_PATHS.POSTS.GET_BY_TAG(encodeURIComponent(tagName))}?page=${pagination.currentPage}&limit=${pagination.limit}`
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
                console.error("Gagal mengambil artikel berdasarkan tag:", err.message);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPostsByTag();
    }, [tagName, pagination.currentPage, pagination.limit]);

    return (
        <BlogLayout activeMenu="Topics">
            <div className="space-y-10 pb-16">
                {/* Tag Header Banner */}
                <section className="bg-linear-to-r from-sky-500 via-sky-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-lg shadow-sky-500/15 relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-100 hover:text-white transition-colors"
                        >
                            <LuArrowLeft className="text-sm" /> Kembali ke Beranda
                        </Link>

                        <div className="flex items-center gap-3">
                            <span className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-xl">
                                <LuTag className="text-white" />
                            </span>
                            <div>
                                <span className="text-xs uppercase tracking-wider text-sky-200 font-bold">
                                    Tag Topik
                                </span>
                                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                                    #{tagName}
                                </h1>
                            </div>
                        </div>

                        <p className="text-xs md:text-sm text-sky-100">
                            Menampilkan kumpulan artikel, tutorial, dan dokumentasi yang berfokus pada topik{" "}
                            <span className="font-bold underline decoration-sky-300">#{tagName}</span>.
                        </p>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="space-y-6">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-slate-800 pb-4">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                            Daftar Artikel ({pagination.totalPosts})
                        </h2>

                        <button
                            onClick={() => navigate("/search")}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-sky-100 dark:border-sky-800/40"
                        >
                            Cari Topik Lain
                        </button>
                    </div>

                    {/* Posts Grid / Loader / Empty */}
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
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 space-y-4">
                            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-sky-100 dark:border-sky-800/40">
                                🏷️
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Belum Ada Artikel untuk Tag Ini
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Saat ini belum ada artikel yang menggunakan tag #{tagName}. Silakan eksplorasi topik lainnya di beranda.
                                </p>
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate("/")}
                                    className="text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                                >
                                    Eksplorasi Beranda
                                </button>
                            </div>
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

export default PostByTags;
