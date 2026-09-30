import { useState, useRef, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuSend, LuBot, LuLoader, LuSparkles } from "react-icons/lu";

const PROMPT_SUGGESTIONS = [
    "Beri 3 ide sub-heading untuk artikel ini",
    "Buatkan paragraf kesimpulan dan call-to-action",
    "Buatkan analogi sederhana untuk menjelaskan topik ini",
    "Apa kekurangan materi artikel ini yang perlu ditambah?",
];

const ChatTab = ({ articleContext }) => {
    const [messages, setMessages] = useState([
        {
            sender: "assistant",
            text: "Halo! Saya Asisten Penulis AI. Saya sudah membaca konteks judul dan tulisan artikel Anda. Ada yang bisa saya bantu untuk memperkaya artikel ini?",
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputMessage;
        if (!query || !query.trim()) return;

        const userMsg = { sender: "user", text: query.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInputMessage("");
        setLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
                message: query.trim(),
                articleContext,
            });

            if (response.data?.success && response.data.reply) {
                const botMsg = { sender: "assistant", text: response.data.reply };
                setMessages((prev) => [...prev, botMsg]);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghubungi Asisten AI.");
            setMessages((prev) => [
                ...prev,
                {
                    sender: "assistant",
                    text: "Maaf, terjadi kesalahan saat menghubungi server AI. Silakan coba kembali sesaat lagi.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[520px]">
            {/* Context Badge */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-2.5 mb-3 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                    <LuSparkles className="text-xs" /> Terhubung dengan Konteks Artikel
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate max-w-[140px]">
                    {articleContext?.title || "Tanpa Judul"}
                </span>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar text-xs">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-2.5 ${
                            msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        {msg.sender === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 text-xs shadow-xs">
                                <LuBot />
                            </div>
                        )}

                        <div
                            className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                                msg.sender === "user"
                                    ? "bg-sky-500 text-white rounded-br-xs shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-xs border border-gray-200/60 dark:border-slate-700 shadow-xs"
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 pl-8">
                        <LuLoader className="animate-spin text-sm" />
                        <span className="italic">Asisten AI sedang berpikir...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Prompt Suggestions */}
            <div className="py-2 space-y-1.5 border-t border-gray-100 dark:border-slate-800 mt-2">
                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold block">
                    Ide pertanyaan cepat:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                    {PROMPT_SUGGESTIONS.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(item)}
                            disabled={loading}
                            className="text-[10px] text-left bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Input Bar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                }}
                className="pt-2"
            >
                <div className="flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1.5 focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ketik pertanyaan untuk artikel ini..."
                        className="w-full text-xs text-gray-800 dark:text-slate-100 bg-transparent outline-none px-2 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !inputMessage.trim()}
                        className="p-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                        <LuSend className="text-xs" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatTab;
