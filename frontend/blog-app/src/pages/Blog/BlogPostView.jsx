import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import MarkdownRenderer from "../../components/Markdown/MarkdownRenderer";
import CommentSection from "../../components/Comments/CommentSection";
import CharAvatar from "../../components/Cards/CharAvatar";
import { DetailSkeleton } from "../../components/Common/SkeletonLoader";
import { useUser } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate, calculateReadingTime } from "../../utils/helper";
import toast from "react-hot-toast";
import {
    LuHeart,
    LuBookmark,
    LuShare2,
    LuMessageSquare,
    LuEye,
    LuClock,
    LuCalendar,
    LuArrowLeft,
    LuSparkles,
} from "react-icons/lu";

const BlogPostView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUser();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Interaksi Like & Bookmark
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

    // Guard untuk view increment agar tidak double count di React StrictMode
    const viewIncrementedRef = useRef(false);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            setLoading(true);
            setNotFound(false);
            viewIncrementedRef.current = false;

            try {
                const response = await axiosInstance.get(API_PATHS.POSTS.GET_BY_SLUG(slug));

                if (response.data?.success && response.data.post) {
                    const postData = response.data.post;
                    setPost(postData);
                    setLikesCount(postData.likeCount || (postData.likes ? postData.likes.length : 0));

                    // Cek status like dari current user
                    if (user && postData.likes) {
                        const userLiked = postData.likes.some((id) =>
                            typeof id === "object" ? id._id === user._id : id === user._id
                        );
                        setIsLiked(userLiked);
                    }

                    // Cek status bookmark dari current user
                    if (user && user.savedPosts) {
                        const userSaved = user.savedPosts.some((id) =>
                            typeof id === "object" ? id._id === postData._id : id === postData._id
                        );
                        setIsBookmarked(userSaved);
                    }

                    // Tambah view count secara atomik (hanya 1x per load artikel)
                    if (!viewIncrementedRef.current) {
                        viewIncrementedRef.current = true;
                        axiosInstance
                            .post(API_PATHS.POSTS.INCREMENT_VIEW(postData._id))
                            .then((viewRes) => {
                                if (viewRes.data?.views) {
                                    setPost((prev) => (prev ? { ...prev, views: viewRes.data.views } : prev));
                                }
                            })
                            .catch(() => {});
                    }
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error("Gagal mengambil detail artikel:", err.message);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug, user]);

    // Handle Like Toggle
    const handleLikeToggle = async () => {
        if (!isAuthenticated) {
            toast.error("Silakan login untuk menyukai artikel ini.");
            return;
        }

        if (isLikeLoading || !post) return;
        setIsLikeLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.POSTS.LIKE(post._id));
            if (response.data?.success) {
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likeCount);
                toast.success(response.data.liked ? "Artikel disukai!" : "Batal menyukai artikel.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal memproses like.");
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Handle Bookmark Toggle
    const handleBookmarkToggle = async () => {
        if (!isAuthenticated) {
            toast.error("Silakan login untuk menyimpan artikel ini.");
            return;
        }

        if (isBookmarkLoading || !post) return;
        setIsBookmarkLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.POSTS.TOGGLE_BOOKMARK(post._id));
            if (response.data?.success) {
                setIsBookmarked(response.data.bookmarked);
                toast.success(response.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menyimpan bookmark.");
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    // Salin Tautan Berbagi (Share Link)
    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                toast.success("Tautan artikel berhasil disalin ke clipboard!");
            } else {
                toast.error("Fitur copy tidak didukung browser ini.");
            }
        } catch {
            toast.error("Gagal menyalin tautan.");
        }
    };

    // Scroll mulus ke bagian komentar
    const scrollToComments = () => {
        const commentElement = document.getElementById("comments-section");
        if (commentElement) {
            commentElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <BlogLayout activeMenu="Home">
            {loading ? (
                /* Skeleton Loader Saat Artikel Dimuat */
                <DetailSkeleton />
            ) : notFound || !post ? (
                /* Not Found 404 State */
                <div className="max-w-xl mx-auto text-center py-24 space-y-4">
                    <div className="w-20 h-20 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                        🔍
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artikel Tidak Ditemukan</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Artikel dengan tautan ini mungkin telah dihapus, diubah slug-nya, atau berstatus draft.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                        >
                            <LuArrowLeft className="text-base" /> Kembali ke Beranda
                        </button>
                    </div>
                </div>
            ) : (
                /* Tampilan Lengkap Artikel */
                <article className="max-w-4xl mx-auto pb-20 space-y-8">
                    {/* Top Navigation & Category */}
                    <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                            <LuArrowLeft className="text-sm" /> Beranda
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                                {post.category || "General"}
                            </span>
                        </div>
                    </div>

                    {/* Article Title */}
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    {/* Author Bar & Metadata */}
                    <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-gray-100 dark:border-slate-800">
                        {/* Author Profile */}
                        <div className="flex items-center gap-3.5">
                            {post.author?.profileImageUrl ? (
                                <img
                                    src={post.author.profileImageUrl}
                                    alt={post.author.name}
                                    className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                                />
                            ) : (
                                <CharAvatar
                                    fullName={post.author?.name || "Penulis"}
                                    width="w-11"
                                    height="h-11"
                                    style="text-sm"
                                />
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                    {post.author?.name || "Penulis"}
                                </h3>
                                <p className="text-xs text-gray-400 dark:text-slate-400 capitalize">
                                    {post.author?.role || "Author"} Lingkaran Koding
                                </p>
                            </div>
                        </div>

                        {/* Metadata Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5" title="Tanggal publikasi">
                                <LuCalendar className="text-sm text-gray-400 dark:text-slate-500" />
                                {formatDate(post.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5" title="Estimasi waktu baca">
                                <LuClock className="text-sm text-gray-400 dark:text-slate-500" />
                                {calculateReadingTime(post.content)} menit baca
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5" title="Jumlah pembaca">
                                <LuEye className="text-sm text-gray-400 dark:text-slate-500" />
                                {post.views || 0} views
                            </span>
                        </div>
                    </div>

                    {/* Sticky Action Bar (Like, Bookmark, Share, Jump to Comment) */}
                    <div className="sticky top-20 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200/80 dark:border-slate-800 rounded-2xl p-3 px-6 shadow-md flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Like Button */}
                            <button
                                onClick={handleLikeToggle}
                                disabled={isLikeLoading}
                                className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                    isLiked
                                        ? "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 shadow-xs"
                                        : "text-gray-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                }`}
                                title={isLiked ? "Batalkan suka" : "Sukai artikel ini"}
                            >
                                <LuHeart className={`text-base md:text-lg ${isLiked ? "fill-red-500" : ""}`} />
                                <span>{likesCount} Suka</span>
                            </button>

                            {/* Bookmark Button */}
                            <button
                                onClick={handleBookmarkToggle}
                                disabled={isBookmarkLoading}
                                className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                    isBookmarked
                                        ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shadow-xs"
                                        : "text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                }`}
                                title={isBookmarked ? "Tersimpan di bookmark" : "Simpan ke bookmark"}
                            >
                                <LuBookmark
                                    className={`text-base md:text-lg ${isBookmarked ? "fill-sky-500" : ""}`}
                                />
                                <span className="hidden sm:inline">{isBookmarked ? "Tersimpan" : "Simpan"}</span>
                            </button>

                            {/* Jump to Comments */}
                            <button
                                onClick={scrollToComments}
                                className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Lihat diskusi komentar"
                            >
                                <LuMessageSquare className="text-base md:text-lg" />
                                <span className="hidden sm:inline">Komentar</span>
                            </button>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-gray-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-gray-200/50 dark:border-slate-700"
                            title="Bagikan artikel ini"
                        >
                            <LuShare2 className="text-base" />
                            <span className="hidden sm:inline">Bagikan</span>
                        </button>
                    </div>

                    {/* Featured Cover Image */}
                    {post.coverImageUrl && (
                        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800">
                            <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-auto max-h-[500px] object-cover"
                            />
                        </div>
                    )}

                    {/* Summary Lead Block */}
                    {post.summary && (
                        <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/50 rounded-2xl p-5 md:p-6 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                                <LuSparkles className="text-sm" /> Ringkasan Artikel
                            </div>
                            <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed font-normal">
                                {post.summary}
                            </p>
                        </div>
                    )}

                    {/* Markdown Body Content */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-gray-100/80 dark:border-slate-800 shadow-xs transition-colors">
                        <MarkdownRenderer content={post.content} />
                    </div>

                    {/* Tags List */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="space-y-3 pt-4">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                Topik Terkait:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/tag/${tag}`}
                                        className="text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-1.5 rounded-xl transition-colors border border-gray-200/60 dark:border-slate-700"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Bio Card */}
                    <div className="bg-linear-to-r from-sky-50 to-indigo-50/40 dark:from-slate-900 dark:to-slate-900/60 rounded-3xl p-6 md:p-8 border border-sky-100/70 dark:border-slate-800 flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left transition-colors">
                        {post.author?.profileImageUrl ? (
                            <img
                                src={post.author.profileImageUrl}
                                alt={post.author.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs shrink-0"
                            />
                        ) : (
                            <CharAvatar
                                fullName={post.author?.name || "Penulis"}
                                width="w-16"
                                height="h-16"
                                style="text-xl shrink-0"
                            />
                        )}

                        <div className="space-y-1 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                Tentang Penulis
                            </span>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {post.author?.name || "Penulis"}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed max-w-xl">
                                {post.author?.bio ||
                                    "Penulis dan kontributor aktif di Lingkaran Koding, berdedikasi membagikan wawasan dan tutorial pengembangan software modern."}
                            </p>
                        </div>
                    </div>

                    {/* Discussion / Comments Section */}
                    <CommentSection postId={post._id} postAuthorId={post.author?._id} />
                </article>
            )}
        </BlogLayout>
    );
};

export default BlogPostView;
