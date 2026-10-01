import { useState } from "react";
import { Link } from "react-router-dom";
import { LuHeart, LuBookmark, LuEye, LuClock } from "react-icons/lu";
import { formatDate, calculateReadingTime, sanitizeExcerpt, getValidImageUrl } from "../../utils/helper";
import CharAvatar from "./CharAvatar";
import { useUser } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const BlogPostCard = ({ post }) => {
    const { user, isAuthenticated } = useUser();

    // Inisialisasi state like dan bookmark dari data post dan user
    const [likesCount, setLikesCount] = useState(post.likeCount || (post.likes ? post.likes.length : 0));
    const [isLiked, setIsLiked] = useState(() => {
        if (!user || !post.likes) return false;
        return post.likes.some((id) => (typeof id === "object" ? id._id === user._id : id === user._id));
    });

    const [isBookmarked, setIsBookmarked] = useState(() => {
        if (!user || !user.savedPosts) return false;
        return user.savedPosts.some((id) => (typeof id === "object" ? id._id === post._id : id === post._id));
    });

    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

    // Handler Like
    const handleLikeToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error("Silakan login terlebih dahulu untuk menyukai artikel.");
            return;
        }

        if (isLikeLoading) return;
        setIsLikeLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.POSTS.LIKE(post._id));
            if (response.data?.success) {
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likeCount);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal memproses like.");
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Handler Bookmark
    const handleBookmarkToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error("Silakan login terlebih dahulu untuk menyimpan artikel.");
            return;
        }

        if (isBookmarkLoading) return;
        setIsBookmarkLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.POSTS.TOGGLE_BOOKMARK(post._id));
            if (response.data?.success) {
                setIsBookmarked(response.data.bookmarked);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal menyimpan artikel.");
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    const readingTime = calculateReadingTime(post.content);
    const excerpt = post.summary || sanitizeExcerpt(post.content, 110);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 overflow-hidden shadow-xs hover:shadow-xl dark:hover:shadow-slate-800/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
                {/* Cover Thumbnail Image */}
                <Link to={`/${post.slug}`} className="block relative aspect-16/9 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {post.coverImageUrl ? (
                        <img
                            src={getValidImageUrl(post.coverImageUrl)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-sky-500 to-cyan-600 flex items-center justify-center p-6 text-white text-center">
                            <span className="text-sm font-semibold opacity-90">{post.category}</span>
                        </div>
                    )}

                    {/* Category Tag Badge */}
                    <span className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-sky-600 dark:text-sky-400 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-transparent dark:border-slate-700/60">
                        {post.category || "General"}
                    </span>
                </Link>

                {/* Content Details */}
                <div className="p-5">
                    {/* Date & Reading Time */}
                    <div className="flex items-center gap-3 text-[12px] text-gray-400 dark:text-slate-400 mb-2">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <LuClock className="text-xs" />
                            {readingTime} mnt baca
                        </span>
                    </div>

                    {/* Title */}
                    <Link to={`/${post.slug}`}>
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                        </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {excerpt}
                    </p>

                    {/* Tags List */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                                <Link
                                    key={idx}
                                    to={`/tag/${tag}`}
                                    className="text-[10px] bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700/80 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Card Footer: Author & Engagement Interactions */}
            <div className="px-5 py-3.5 bg-gray-50/60 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                {/* Author Info */}
                <div className="flex items-center gap-2.5">
                    {post.author?.profileImageUrl ? (
                        <img
                            src={getValidImageUrl(post.author.profileImageUrl)}
                            alt={post.author.name}
                            className="w-7 h-7 rounded-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <CharAvatar
                            fullName={post.author?.name || "Penulis"}
                            width="w-7"
                            height="h-7"
                            style="text-[10px]"
                        />
                    )}
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate max-w-[100px]">
                        {post.author?.name || "Penulis"}
                    </span>
                </div>

                {/* Interactions: Views, Like, Bookmark */}
                <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-400">
                        <LuEye className="text-sm" />
                        {post.views || 0}
                    </span>

                    {/* Like Button */}
                    <button
                        onClick={handleLikeToggle}
                        className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${
                            isLiked ? "text-red-500 font-semibold" : "hover:text-red-500"
                        }`}
                        title={isLiked ? "Batalkan Suka" : "Sukai Artikel"}
                    >
                        <LuHeart className={`text-sm ${isLiked ? "fill-red-500" : ""}`} />
                        <span>{likesCount}</span>
                    </button>

                    {/* Bookmark Button */}
                    <button
                        onClick={handleBookmarkToggle}
                        className={`text-xs cursor-pointer transition-colors ${
                            isBookmarked ? "text-sky-500 dark:text-sky-400" : "hover:text-sky-500 dark:hover:text-sky-400"
                        }`}
                        title={isBookmarked ? "Hapus dari Simpanan" : "Simpan Artikel"}
                    >
                        <LuBookmark className={`text-sm ${isBookmarked ? "fill-sky-500" : ""}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogPostCard;
