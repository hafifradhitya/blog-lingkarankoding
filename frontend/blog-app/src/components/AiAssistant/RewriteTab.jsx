import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuWand, LuCopy, LuCheck, LuLoader, LuArrowRight } from "react-icons/lu";

const ACTIONS = [
    { id: "fix_grammar", label: "Perbaiki Tata Bahasa & Typo" },
    { id: "more_engaging", label: "Lebih Menarik & Mengalir" },
    { id: "technical", label: "Lebih Teknis & Profesional" },
    { id: "make_shorter", label: "Ringkas & Padat" },
    { id: "make_longer", label: "Perluas & Tambah Contoh" },
];

const RewriteTab = ({ onInsertText, currentContent }) => {
    const [inputText, setInputText] = useState("");
    const [action, setAction] = useState("fix_grammar");
    const [tone, setTone] = useState("Informatif");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleRewrite = async (e) => {
        e.preventDefault();
        const textToRewrite = inputText || currentContent;

        if (!textToRewrite || !textToRewrite.trim()) {
            toast.error("Silakan masukkan teks yang ingin diperbaiki.");
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const response = await axiosInstance.post(API_PATHS.AI.REWRITE, {
                text: textToRewrite.trim(),
                action,
                tone,
                language: "Indonesia",
            });

            if (response.data?.success) {
                setResult(response.data);
                toast.success("Teks berhasil diperbaiki oleh AI!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal memperbaiki teks.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result?.rewrittenText) return;
        try {
            await navigator.clipboard.writeText(result.rewrittenText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Teks hasil rewrite berhasil disalin!");
        } catch {
            toast.error("Gagal menyalin teks.");
        }
    };

    const handleApplyToEditor = () => {
        if (!result?.rewrittenText) return;
        onInsertText(result.rewrittenText);
        toast.success("Teks hasil perbaikan ditambahkan ke konten artikel!");
    };

    return (
        <div className="space-y-4">
            <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-4 space-y-1 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300">
                    <LuWand className="text-sm" /> Polishing & Rewrite Teks
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                    Perbaiki tata bahasa, tingkatkan kejelasan kalimat, atau ubah gaya bahasa paragraf artikel Anda.
                </p>
            </div>

            <form onSubmit={handleRewrite} className="space-y-3">
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Teks yang Ingin Diperbaiki</label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ketik atau tempel paragraf yang ingin diperbaiki di sini..."
                        rows={3}
                        className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                </div>

                {/* Pilihan Action & Tone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400">Pilih Aksi:</label>
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:border-purple-500"
                        >
                            {ACTIONS.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400">Gaya Nada (Tone):</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:border-purple-500"
                        >
                            <option value="Informatif">Informatif & Jelas</option>
                            <option value="Santai & Bersahabat">Santai & Bersahabat</option>
                            <option value="Formal & Akademis">Formal & Profesional</option>
                            <option value="Persuasif">Persuasif & Menarik</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || (!inputText.trim() && !currentContent)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <LuLoader className="animate-spin text-sm" />
                            <span>Memproses Rewrite...</span>
                        </>
                    ) : (
                        <>
                            <LuWand className="text-sm" />
                            <span>Perbaiki Teks Sekarang</span>
                        </>
                    )}
                </button>
            </form>

            {/* Hasil Perbaikan */}
            {result && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 space-y-3 shadow-xs animate-in fade-in transition-colors">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-white">Hasil Teks yang Diperbaiki</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors text-xs cursor-pointer border border-gray-200 dark:border-slate-700"
                                title="Salin teks"
                            >
                                {copied ? <LuCheck className="text-emerald-500" /> : <LuCopy />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 text-xs text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap border border-gray-100 dark:border-slate-700">
                        {result.rewrittenText}
                    </div>

                    {result.changesMade && (
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 italic">
                            <LuArrowRight className="inline mr-1 text-purple-500" />
                            Perubahan: {result.changesMade}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handleApplyToEditor}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                        <LuCheck className="text-xs" /> Sisipkan ke Konten Editor
                    </button>
                </div>
            )}
        </div>
    );
};

export default RewriteTab;
