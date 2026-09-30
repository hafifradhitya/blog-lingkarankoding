import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuLightbulb, LuCheck, LuLoader, LuArrowRight } from "react-icons/lu";

const TitleSuggesterTab = ({ onApplyTitleAndSlug, currentContent, currentTitle }) => {
    const [topicKeyword, setTopicKeyword] = useState(currentTitle || "");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        const textToAnalyze = currentContent || topicKeyword;

        if (!textToAnalyze || !textToAnalyze.trim()) {
            toast.error("Tulis konten di editor atau masukkan kata kunci topik di bawah.");
            return;
        }

        setLoading(true);
        setSuggestions([]);
        try {
            const response = await axiosInstance.post(API_PATHS.AI.GENERATE_TITLE, {
                content: currentContent || "",
                topic: topicKeyword.trim() || undefined,
            });

            if (response.data?.success && response.data.suggestions) {
                setSuggestions(response.data.suggestions);
                toast.success("Rekomendasi judul SEO berhasil dibuat!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghasilkan saran judul.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (suggestion) => {
        onApplyTitleAndSlug(suggestion.title, suggestion.slug);
        toast.success("Judul dan slug berhasil diterapkan ke editor!");
    };

    return (
        <div className="space-y-5">
            <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 rounded-2xl p-4 space-y-1 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <LuLightbulb className="text-sm" /> Rekomendasi Judul & Slug SEO
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                    AI menganalisis konten tulisan Anda dan merumuskan variasi judul yang klik-able (*high CTR*) serta ramah mesin pencari.
                </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3">
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                        Topik atau Kata Kunci Tambahan (Opsional)
                    </label>
                    <input
                        type="text"
                        value={topicKeyword}
                        onChange={(e) => setTopicKeyword(e.target.value)}
                        placeholder="Contoh: React 19 server actions, optimasi performa..."
                        className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                        {currentContent && currentContent.trim()
                            ? "✓ Konten artikel di editor akan otomatis dianalisis oleh AI."
                            : "Ketik kata kunci topik di atas jika editor masih kosong."}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <LuLoader className="animate-spin text-sm" />
                            <span>Menganalisis & Merumuskan Judul...</span>
                        </>
                    ) : (
                        <>
                            <LuLightbulb className="text-sm" />
                            <span>Dapatkan Rekomendasi Judul</span>
                        </>
                    )}
                </button>
            </form>

            {/* List Rekomendasi Judul */}
            {suggestions.length > 0 && (
                <div className="space-y-3 animate-in fade-in">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Pilih Rekomendasi Judul:</span>
                    {suggestions.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 space-y-2 hover:border-sky-400 dark:hover:border-sky-500 transition-colors shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{item.title}</h4>
                                <button
                                    type="button"
                                    onClick={() => handleApply(item)}
                                    className="shrink-0 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-500 dark:hover:bg-sky-600 text-sky-600 dark:text-sky-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer border border-sky-100 dark:border-sky-800/40"
                                    title="Gunakan judul ini"
                                >
                                    <LuCheck className="text-sm" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                                <span>Slug: /{item.slug}</span>
                            </div>

                            {item.explanation && (
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-gray-50 dark:border-slate-800">
                                    <LuArrowRight className="inline mr-1 text-amber-500" />
                                    {item.explanation}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TitleSuggesterTab;
