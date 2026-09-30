import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuWand, LuSparkles, LuCheck, LuLoader } from "react-icons/lu";

const DraftGeneratorTab = ({ onApplyDraft, currentCategory }) => {
    const [topic, setTopic] = useState("");
    const [tone, setTone] = useState("Informatif & Edukatif");
    const [category, setCategory] = useState(currentCategory || "Web Development");
    const [language, setLanguage] = useState("Indonesia");
    const [loading, setLoading] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            toast.error("Silakan masukkan topik artikel terlebih dahulu.");
            return;
        }

        setLoading(true);
        setGeneratedDraft(null);
        try {
            const response = await axiosInstance.post(API_PATHS.AI.GENERATE_DRAFT, {
                topic: topic.trim(),
                category,
                tone,
                language,
            });

            if (response.data?.success && response.data.data) {
                setGeneratedDraft(response.data.data);
                toast.success("Draft artikel berhasil dibuat oleh Asisten AI!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghasilkan draft dengan AI.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!generatedDraft) return;
        onApplyDraft(generatedDraft);
        toast.success("Draft berhasil diterapkan ke editor formulir!");
    };

    return (
        <div className="space-y-5">
            <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/50 rounded-2xl p-4 space-y-1 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300">
                    <LuSparkles className="text-sm" /> Generate Draft Artikel Lengkap
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                    Asisten AI akan menyusun judul, slug, ringkasan, tag, dan struktur artikel lengkap dalam format Markdown.
                </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
                {/* Topik Input */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                        Topik atau Ide Pokok <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Contoh: Cara implementasi JWT Authentication dan Refresh Token di Node.js Express..."
                        rows={3}
                        className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors"
                    />
                </div>

                {/* Parameter Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400">Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:border-sky-500"
                        >
                            <option value="Web Development">Web Development</option>
                            <option value="Artificial Intelligence">AI & Machine Learning</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Database">Database</option>
                            <option value="Tutorial">Tutorial</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400">Gaya Bahasa (Tone)</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:border-sky-500"
                        >
                            <option value="Informatif & Edukatif">Informatif & Edukatif</option>
                            <option value="Santai & Ramah">Santai & Ramah</option>
                            <option value="Profesional & Mendalam">Profesional</option>
                            <option value="Praktis / Step-by-Step Tutorial">Step-by-Step</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400">Bahasa</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:border-sky-500"
                        >
                            <option value="Indonesia">Bahasa Indonesia</option>
                            <option value="Inggris">English</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !topic.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <LuLoader className="animate-spin text-sm" />
                            <span>Menyusun Draft Artikel...</span>
                        </>
                    ) : (
                        <>
                            <LuWand className="text-sm" />
                            <span>Mulai Generate Draft</span>
                        </>
                    )}
                </button>
            </form>

            {/* Preview Hasil Draft */}
            {generatedDraft && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 space-y-4 shadow-sm animate-in fade-in transition-colors">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-white">Draft Berhasil Dibuat</span>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                            <LuCheck className="text-xs" /> Terapkan ke Editor
                        </button>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-gray-400 dark:text-slate-500 font-semibold">Judul:</span>
                            <p className="font-bold text-gray-900 dark:text-white">{generatedDraft.title}</p>
                        </div>

                        {generatedDraft.summary && (
                            <div>
                                <span className="text-gray-400 dark:text-slate-500 font-semibold">Ringkasan:</span>
                                <p className="text-gray-600 dark:text-slate-300">{generatedDraft.summary}</p>
                            </div>
                        )}

                        {generatedDraft.tags && generatedDraft.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {generatedDraft.tags.map((t, idx) => (
                                    <span key={idx} className="bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-[10px] px-2 py-0.5 rounded border border-sky-100 dark:border-sky-800/40">
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                            <span className="text-gray-400 dark:text-slate-500 font-semibold">Cuplikan Konten:</span>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-gray-700 dark:text-slate-200 whitespace-pre-wrap mt-1">
                                {generatedDraft.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftGeneratorTab;
