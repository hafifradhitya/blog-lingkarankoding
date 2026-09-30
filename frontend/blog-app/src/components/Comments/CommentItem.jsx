import { useState } from "react";
import { LuReply, LuTrash2, LuCornerDownRight, LuSend } from "react-icons/lu";
import CharAvatar from "../Cards/CharAvatar";
import { formatDate } from "../../utils/helper";
import { useUser } from "../../context/userContext";

const CommentItem = ({
    comment,
    replies = [],
    postAuthorId,
    onAddReply,
    onDeleteComment,
    isSubmitting,
}) => {
    const { user, isAuthenticated } = useUser();
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const isCommentAuthor = user && comment.author && user._id === comment.author._id;
    const isPostAuthor = user && postAuthorId && user._id === postAuthorId;
    const isAdmin = user && user.role === "admin";
    const canDelete = isCommentAuthor || isPostAuthor || isAdmin;

    const isAuthorOfPost =
        comment.author && postAuthorId && comment.author._id === postAuthorId;

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        const success = await onAddReply(replyContent.trim(), comment._id);
        if (success) {
            setReplyContent("");
            setShowReplyBox(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Main Comment Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-slate-800 shadow-xs hover:border-gray-200 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                        {comment.author?.profileImageUrl ? (
                            <img
                                src={comment.author.profileImageUrl}
                                alt={comment.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <CharAvatar
                                fullName={comment.author?.name || "Pengguna"}
                                width="w-8"
                                height="h-8"
                                style="text-xs"
                            />
                        )}

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                                    {comment.author?.name || "Pengguna"}
                                </span>

                                {isAuthorOfPost && (
                                    <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800/60">
                                        Penulis
                                    </span>
                                )}

                                {comment.author?.role === "admin" && !isAuthorOfPost && (
                                    <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Actions: Delete Button */}
                    {canDelete && (
                        <button
                            onClick={() => onDeleteComment(comment._id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Hapus komentar"
                        >
                            <LuTrash2 className="text-sm" />
                        </button>
                    )}
                </div>

                {/* Comment Content */}
                <p className="text-xs md:text-sm text-gray-700 dark:text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                </p>

                {/* Reply Trigger Button */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-800/80">
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                alert("Silakan login terlebih dahulu untuk membalas komentar.");
                                return;
                            }
                            setShowReplyBox(!showReplyBox);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                    >
                        <LuReply className="text-sm" />
                        <span>{showReplyBox ? "Tutup Balasan" : "Balas"}</span>
                    </button>
                </div>

                {/* Inline Reply Input Form */}
                {showReplyBox && (
                    <form onSubmit={handleReplySubmit} className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                        <div className="relative">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Balas komentar @${comment.author?.name || "pengguna"}...`}
                                rows={2}
                                className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReplyBox(false);
                                    setReplyContent("");
                                }}
                                className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !replyContent.trim()}
                                className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                            >
                                <LuSend className="text-xs" />
                                <span>Kirim Balasan</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Nested Child Replies List */}
            {replies.length > 0 && (
                <div className="pl-6 md:pl-10 space-y-3 border-l-2 border-sky-100 dark:border-sky-900/50 ml-4">
                    {replies.map((reply) => {
                        const isReplyAuthor = user && reply.author && user._id === reply.author._id;
                        const canDeleteReply = isReplyAuthor || isPostAuthor || isAdmin;
                        const isReplyAuthorOfPost =
                            reply.author && postAuthorId && reply.author._id === postAuthorId;

                        return (
                            <div
                                key={reply._id}
                                className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-3.5 md:p-4 border border-gray-100 dark:border-slate-800 relative group transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <LuCornerDownRight className="text-sky-400 text-xs shrink-0" />
                                        {reply.author?.profileImageUrl ? (
                                            <img
                                                src={reply.author.profileImageUrl}
                                                alt={reply.author.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <CharAvatar
                                                fullName={reply.author?.name || "Pengguna"}
                                                width="w-6"
                                                height="h-6"
                                                style="text-[9px]"
                                            />
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {reply.author?.name || "Pengguna"}
                                                </span>
                                                {isReplyAuthorOfPost && (
                                                    <span className="text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800/60">
                                                        Penulis
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                                {formatDate(reply.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {canDeleteReply && (
                                        <button
                                            onClick={() => onDeleteComment(reply._id)}
                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                            title="Hapus balasan"
                                        >
                                            <LuTrash2 className="text-xs" />
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-gray-700 dark:text-slate-300 mt-2 pl-5 whitespace-pre-wrap leading-relaxed">
                                    {reply.content}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
