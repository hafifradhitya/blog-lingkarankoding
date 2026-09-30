import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import {
    LuFileText,
    LuSearchCheck,
    LuCheck,
    LuLoader,
    LuCircleCheck,
    LuTriangleAlert,
    LuLightbulb,
} from "react-icons/lu";

const SeoSummaryTab = ({ onApplySummary, currentContent, currentTitle, currentTags }) => {
    const [subTab, setSubTab] = useState("summary"); // 'summary' | 'seo'

    // Summary States
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState("");
    const [readingTime, setReadingTime] = useState(null);

    // SEO States
    const [focusKeyword, setFocusKeyword] = useState("");
    const [loadingSeo, setLoadingSeo] = useState(false);
    const [seoAnalysis, setSeoAnalysis] = useState(null);

    // Handler Generate Summary
    const handleGenerateSummary = async () => {
        if (!currentContent || !currentContent.trim()) {
            toast.error("Tulis konten artikel di editor terlebih dahulu untuk membuat ringkasan.");
            return;
        }

        setLoadingSummary(true);
        try {
            const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
                content: currentContent,
            });

            if (response.data?.success) {
                setGeneratedSummary(response.data.summary);
                setReadingTime(response.data.readingTimeMinutes);
                toast.success("Ringkasan artikel berhasil dibuat oleh AI!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal membuat ringkasan otomatis.");
        } finally {
            setLoadingSummary(false);
        }
    };

    // Handler Apply Summary
    const handleApplySummary = () => {
        if (!generatedSummary) return;
        onApplySummary(generatedSummary);
        toast.success("Ringkasan berhasil diterapkan ke form editor!");
    };

    // Handler Audit SEO
    const handleRunSeoCheck = async (e) => {
        e.preventDefault();
        if (!currentTitle && !currentContent) {
            toast.error("Silakan isi judul atau konten artikel sebelum melakukan audit SEO.");
            return;
        }

        setLoadingSeo(true);
        setSeoAnalysis(null);
        try {
            const response = await axiosInstance.post(API_PATHS.AI.SEO_CHECK, {
                title: currentTitle || "",
                content: currentContent || "",
                tags: currentTags || [],
                focusKeyword: focusKeyword.trim() || undefined,
            });

            if (response.data?.success && response.data.analysis) {
                setSeoAnalysis(response.data.analysis);
                toast.success("Audit SEO selesai!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal melakukan audit SEO.");
        } finally {
            setLoadingSeo(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1">
                <button
                    type="button"
                    onClick={() => setSubTab("summary")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        subTab === "summary"
                            ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                    <LuFileText className="text-sm" /> Ringkasan Otomatis
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("seo")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        subTab === "seo"
                            ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
                            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                    <LuSearchCheck className="text-sm" /> Audit Skor SEO
                </button>
            </div>

            {/* TAB 1: Auto Summary */}
            {subTab === "summary" && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-4 space-y-1 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <LuFileText className="text-sm" /> Generator Excerpt & Ringkasan
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                            Meringkas isi artikel menjadi 2-3 kalimat padat untuk deskripsi kartu dan meta description pencarian.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={loadingSummary}
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {loadingSummary ? (
                            <>
                                <LuLoader className="animate-spin text-sm" />
                                <span>Menganalisis & Meringkas...</span>
                            </>
                        ) : (
                            <>
                                <LuFileText className="text-sm" />
                                <span>Buat Ringkasan Otomatis</span>
                            </>
                        )}
                    </button>

                    {generatedSummary && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 space-y-3 shadow-xs transition-colors">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                                <span className="text-xs font-bold text-gray-800 dark:text-white">Hasil Ringkasan</span>
                                {readingTime && (
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                        Estimasi: ~{readingTime} mnt
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                                {generatedSummary}
                            </p>

                            <button
                                type="button"
                                onClick={handleApplySummary}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <LuCheck className="text-xs" /> Terapkan ke Form Ringkasan
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: SEO Checker */}
            {subTab === "seo" && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/50 rounded-2xl p-4 space-y-1 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300">
                            <LuSearchCheck className="text-sm" /> Audit Kualitas & Skor SEO
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                            Menganalisis kepadatan kata kunci, struktur heading, readability, dan memberikan rekomendasi optimasi.
                        </p>
                    </div>

                    <form onSubmit={handleRunSeoCheck} className="space-y-3">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                Focus Keyword / Kata Kunci Utama (Opsional)
                            </label>
                            <input
                                type="text"
                                value={focusKeyword}
                                onChange={(e) => setFocusKeyword(e.target.value)}
                                placeholder="Contoh: express auth, tutorial react..."
                                className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loadingSeo}
                            className="w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-sky-600/20 disabled:opacity-50"
                        >
                            {loadingSeo ? (
                                <>
                                    <LuLoader className="animate-spin text-sm" />
                                    <span>Mengaudit Konten dengan AI...</span>
                                </>
                            ) : (
                                <>
                                    <LuSearchCheck className="text-sm" />
                                    <span>Jalankan Audit SEO</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Hasil Audit SEO */}
                    {seoAnalysis && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 space-y-4 shadow-xs transition-colors">
                            {/* Score Display */}
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Skor Keseluruhan</span>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {seoAnalysis.overallScore || 0}
                                        <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">/100</span>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        (seoAnalysis.overallScore || 0) >= 80
                                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                            : (seoAnalysis.overallScore || 0) >= 60
                                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                                            : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60"
                                    }`}
                                >
                                    {seoAnalysis.status || "Perlu Perbaikan"}
                                </span>
                            </div>

                            {/* Kelebihan */}
                            {seoAnalysis.strengths && seoAnalysis.strengths.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                        <LuCircleCheck className="text-xs" /> Poin Positif:
                                    </span>
                                    <ul className="space-y-1 text-xs text-gray-600 dark:text-slate-300 pl-4 list-disc">
                                        {seoAnalysis.strengths.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Kelemahan */}
                            {seoAnalysis.weaknesses && seoAnalysis.weaknesses.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                        <LuTriangleAlert className="text-xs" /> Hal yang Kurang:
                                    </span>
                                    <ul className="space-y-1 text-xs text-gray-600 dark:text-slate-300 pl-4 list-disc">
                                        {seoAnalysis.weaknesses.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Rekomendasi */}
                            {seoAnalysis.recommendations && seoAnalysis.recommendations.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
                                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                                        <LuLightbulb className="text-xs" /> Rekomendasi Aksi:
                                    </span>
                                    <ul className="space-y-1 text-xs text-gray-600 dark:text-slate-300 pl-4 list-disc">
                                        {seoAnalysis.recommendations.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SeoSummaryTab;
