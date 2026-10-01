import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import CharAvatar from "../../components/Cards/CharAvatar";
import { TableSkeleton } from "../../components/Common/SkeletonLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate, getValidImageUrl } from "../../utils/helper";
import toast from "react-hot-toast";
import {
    LuSearch,
    LuTrash2,
    LuExternalLink,
    LuMessageSquare,
    LuChevronLeft,
    LuChevronRight,
    LuRefreshCw,
    LuX,
    LuLoader,
} from "react-icons/lu";

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
        limit: 10,
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        commentId: null,
        commentSnippet: "",
        isDeleting: false,
    });

    // Realtime search debouncing (500ms delay)
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

    useEffect(() => {
        let isMounted = true;
        const fetchComments = async () => {
            setLoading(true);
            try {
                let url = `${API_PATHS.COMMENTS.ADMIN_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`;
                if (debouncedSearch) {
                    url += `&search=${encodeURIComponent(debouncedSearch)}`;
                }

                const response = await axiosInstance.get(url);
                if (isMounted && response.data?.success) {
                    setComments(response.data.comments || []);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: response.data.pagination.totalPages || 1,
                        totalComments: response.data.pagination.totalComments || 0,
                    }));
                }
            } catch (err) {
                console.error("Gagal mengambil data komentar admin:", err.message);
                toast.error("Gagal memuat daftar komentar.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchComments();
        return () => {
            isMounted = false;
        };
    }, [pagination.currentPage, pagination.limit, debouncedSearch, refreshTrigger]);

    const handleRefresh = () => {
        setLoading(true);
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleDeleteClick = (comment) => {
        setDeleteModal({
            isOpen: true,
            commentId: comment._id,
            commentSnippet:
                comment.content.length > 80
                    ? comment.content.substring(0, 80) + "..."
                    : comment.content,
            isDeleting: false,
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.commentId) return;

        setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
        try {
            const response = await axiosInstance.delete(
                API_PATHS.COMMENTS.DELETE(deleteModal.commentId)
            );
            if (response.data?.success) {
                toast.success(response.data.message || "Komentar berhasil dihapus.");
                setComments((prev) => prev.filter((c) => c._id !== deleteModal.commentId));
                setPagination((prev) => ({
                    ...prev,
                    totalComments: Math.max(0, prev.totalComments - 1),
                }));
                setDeleteModal({ isOpen: false, commentId: null, commentSnippet: "", isDeleting: false });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghapus komentar.");
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    return (
        <DashboardLayout activeMenu="Comments">
            <div className="space-y-6 pb-20">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Moderasi Komentar Pembaca
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Tinjau opini pembaca di seluruh artikel, dan hapus komentar spam atau tidak pantas.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
                    >
                        <LuRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-xs transition-colors">
                    <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
                        {isSearching ? (
                            <LuLoader className="text-sky-500 text-sm shrink-0 animate-spin" />
                        ) : (
                            <LuSearch className="text-gray-400 dark:text-slate-500 text-sm shrink-0" />
                        )}
                        <input
                            type="text"
                            placeholder="Cari komentar berdasarkan isi komentar, nama pengguna, email, atau judul artikel..."
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
                </div>

                {/* Table Comments */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
                    {loading ? (
                        <TableSkeleton rows={5} />
                    ) : comments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50/70 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3.5 px-4">Pengirim Komentar</th>
                                        <th className="py-3.5 px-4">Isi Komentar</th>
                                        <th className="py-3.5 px-4">Artikel Terkait</th>
                                        <th className="py-3.5 px-4">Tanggal</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {comments.map((comment) => (
                                        <tr key={comment._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                                            {/* Pengirim */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    {comment.author?.profileImageUrl ? (
                                                        <img
                                                            src={getValidImageUrl(comment.author.profileImageUrl)}
                                                            alt={comment.author.name}
                                                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-slate-700"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <CharAvatar
                                                            fullName={comment.author?.name || "Pengguna"}
                                                            width="w-8"
                                                            height="h-8"
                                                            style="text-[9px]"
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block">
                                                            {comment.author?.name || "Pengguna"}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                                            {comment.author?.email || "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Isi Komentar */}
                                            <td className="py-3.5 px-4 max-w-md">
                                                <p className="text-gray-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                                {comment.parentComment && (
                                                    <span className="inline-block mt-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-800/40">
                                                        ↳ Balasan Komentar
                                                    </span>
                                                )}
                                            </td>

                                            {/* Artikel Terkait */}
                                            <td className="py-3.5 px-4 max-w-xs truncate">
                                                {(() => {
                                                    const postItem = comment.post || comment.postId;
                                                    return postItem && postItem.slug ? (
                                                        <Link
                                                            to={`/${postItem.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-800 dark:text-slate-200 font-semibold hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5"
                                                            title={postItem.title}
                                                        >
                                                            <span className="truncate">{postItem.title}</span>
                                                            <LuExternalLink className="text-xs shrink-0 text-gray-400" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-slate-500 italic">
                                                            {postItem?.title || "Artikel telah dihapus"}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Tanggal */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-slate-400 text-[11px]">
                                                {formatDate(comment.createdAt)}
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDeleteClick(comment)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                    title="Hapus Komentar"
                                                >
                                                    <LuTrash2 className="text-sm" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center space-y-3">
                            <div className="w-14 h-14 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-sky-100 dark:border-sky-800/40">
                                <LuMessageSquare />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                                {debouncedSearch
                                    ? `Tidak ada komentar untuk "${debouncedSearch}"`
                                    : "Belum ada komentar pembaca"}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
                                {debouncedSearch
                                    ? `Tidak ditemukan komentar yang cocok dengan kata kunci "${debouncedSearch}". Coba kata kunci lain atau bersihkan pencarian.`
                                    : "Komentar yang dikirimkan oleh pembaca pada artikel blog akan muncul di sini."}
                            </p>
                            {debouncedSearch && (
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
                            )}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                                Menampilkan halaman {pagination.currentPage} dari {pagination.totalPages} ({pagination.totalComments} komentar)
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
                                Konfirmasi Hapus Komentar
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                Apakah Anda yakin ingin menghapus komentar ini?
                            </p>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs italic text-gray-700 dark:text-slate-300 mt-2">
                                &ldquo;{deleteModal.commentSnippet}&rdquo;
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={deleteModal.isDeleting}
                                onClick={() => setDeleteModal({ isOpen: false, commentId: null, commentSnippet: "", isDeleting: false })}
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
                                {deleteModal.isDeleting ? "Menghapus..." : "Ya, Hapus Komentar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Comments;
