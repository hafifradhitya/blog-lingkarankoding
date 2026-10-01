import { useState, useEffect } from "react";
import { LuMessageSquare, LuSend } from "react-icons/lu";
import CommentItem from "./CommentItem";
import CharAvatar from "../Cards/CharAvatar";
import { CommentSkeleton } from "../Common/SkeletonLoader";
import { getValidImageUrl } from "../../utils/helper";
import { useUser } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const CommentSection = ({ postId, postAuthorId }) => {
    const { user, isAuthenticated } = useUser();

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");

    // Ambil daftar komentar untuk postingan ini
    useEffect(() => {
        const fetchComments = async () => {
            if (!postId) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get(API_PATHS.COMMENTS.GET_BY_POST(postId));
                if (response.data?.success) {
                    setComments(response.data.comments || []);
                }
            } catch (err) {
                console.error("Gagal mengambil komentar:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    // Tambah Komentar Utama atau Balasan
    const handleAddComment = async (content, parentCommentId = null) => {
        if (!isAuthenticated) {
            toast.error("Silakan login terlebih dahulu untuk berkomentar.");
            return false;
        }

        if (!content.trim()) {
            toast.error("Isi komentar tidak boleh kosong.");
            return false;
        }

        setSubmitting(true);
        try {
            const payload = {
                postId,
                content: content.trim(),
                parentComment: parentCommentId || null,
            };

            const response = await axiosInstance.post(API_PATHS.COMMENTS.ADD, payload);

            if (response.data?.success) {
                // Tambahkan komentar baru ke daftar lokal
                setComments((prev) => [...prev, response.data.comment]);
                toast.success(parentCommentId ? "Balasan terkirim!" : "Komentar berhasil dipublikasikan!");
                if (!parentCommentId) {
                    setNewCommentText("");
                }
                return true;
            }
            return false;
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal mengirim komentar.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    // Hapus Komentar (termasuk balasan anak jika parent dihapus)
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
            return;
        }

        try {
            const response = await axiosInstance.delete(API_PATHS.COMMENTS.DELETE(commentId));
            if (response.data?.success) {
                // Hapus komentar target beserta reply-nya dari state lokal
                setComments((prev) =>
                    prev.filter((c) => {
                        const isTarget = c._id === commentId;
                        const isChildOfTarget =
                            c.parentComment === commentId ||
                            (typeof c.parentComment === "object" && c.parentComment?._id === commentId);
                        return !isTarget && !isChildOfTarget;
                    })
                );
                toast.success(response.data.message || "Komentar berhasil dihapus.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghapus komentar.");
        }
    };

    // Filter root comments dan replies
    const rootComments = comments.filter((c) => !c.parentComment);
    const getRepliesForComment = (parentId) =>
        comments.filter((c) => {
            if (!c.parentComment) return false;
            return typeof c.parentComment === "object"
                ? c.parentComment._id === parentId
                : c.parentComment === parentId;
        });

    return (
        <section id="comments-section" className="space-y-8 pt-8 border-t border-gray-200 dark:border-slate-800">
            {/* Header Diskusi */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-100 dark:border-sky-800/40">
                        <LuMessageSquare className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            Diskusi Komentar
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            {comments.length} komentar disampaikan
                        </p>
                    </div>
                </div>
            </div>

            {/* Input Komentar Utama */}
            {isAuthenticated ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
                    <div className="flex items-center gap-3">
                        {user.profileImageUrl ? (
                            <img
                                src={getValidImageUrl(user.profileImageUrl)}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <CharAvatar
                                fullName={user.name}
                                width="w-8"
                                height="h-8"
                                style="text-xs"
                            />
                        )}
                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                            Beri tanggapan sebagai <span className="text-sky-600 dark:text-sky-400">{user.name}</span>
                        </span>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddComment(newCommentText);
                        }}
                        className="space-y-3"
                    >
                        <textarea
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Tuliskan pertanyaan, tanggapan, atau wawasan Anda di sini..."
                            rows={3}
                            className="w-full text-xs md:text-sm text-gray-800 dark:text-slate-100 bg-gray-50/70 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                                Gunakan bahasa yang sopan dan relevan dengan topik artikel.
                            </span>

                            <button
                                type="submit"
                                disabled={submitting || !newCommentText.trim()}
                                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-sky-500/20"
                            >
                                <LuSend className="text-xs" />
                                <span>{submitting ? "Mengirim..." : "Kirim Komentar"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-6 text-center space-y-2">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                        Tertarik bergabung dalam diskusi?
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                        Silakan login untuk memberikan tanggapan, bertanya, atau membagikan pengalaman Anda.
                    </p>
                </div>
            )}

            {/* Daftar Komentar */}
            {loading ? (
                <CommentSkeleton count={3} />
            ) : rootComments.length > 0 ? (
                <div className="space-y-4">
                    {rootComments.map((rootComment) => (
                        <CommentItem
                            key={rootComment._id}
                            comment={rootComment}
                            replies={getRepliesForComment(rootComment._id)}
                            postAuthorId={postAuthorId}
                            onAddReply={(content, parentId) => handleAddComment(content, parentId)}
                            onDeleteComment={handleDeleteComment}
                            isSubmitting={submitting}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 space-y-2">
                    <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/50 text-sky-500 rounded-full flex items-center justify-center mx-auto text-xl">
                        💬
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Belum Ada Komentar</h4>
                    <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs mx-auto">
                        Jadilah orang pertama yang mengutarakan pandangan untuk artikel ini!
                    </p>
                </div>
            )}
        </section>
    );
};

export default CommentSection;
