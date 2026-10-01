import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import AiWriterDrawer from "../../components/AiAssistant/AiWriterDrawer";
import FloatingAiButton from "../../components/AiAssistant/FloatingAiButton";
import { useTheme } from "../../context/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { getValidImageUrl } from "../../utils/helper";
import toast from "react-hot-toast";
import {
    LuArrowLeft,
    LuImage,
    LuTrash2,
    LuUpload,
    LuPlus,
    LuX,
    LuCheck,
    LuFileText,
    LuEye,
    LuSparkles,
} from "react-icons/lu";

const DEFAULT_CATEGORIES = [
    "Web Development",
    "Artificial Intelligence",
    "Frontend",
    "Backend",
    "DevOps & Cloud",
    "Database",
    "Tutorial",
    "Tips & Karir",
];

const SUGGESTED_TAGS = [
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "Next.js",
    "Gemini AI",
    "Tailwind CSS",
    "JavaScript",
    "TypeScript",
];

const BlogPostEditor = ({ isEdit: isEditProp }) => {
    const { postSlug } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const isEdit = Boolean(isEditProp || postSlug);

    // Form States
    const [postId, setPostId] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("Web Development");
    const [customCategory, setCustomCategory] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [isDraft, setIsDraft] = useState(false);

    // AI Drawer State
    const [openAiDrawer, setOpenAiDrawer] = useState(false);

    // Loading & Submitting States
    const [loadingPost, setLoadingPost] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Auto-generate slug helper dari title
    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (!isEdit && !slug) {
            const autoSlug = val
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            setSlug(autoSlug);
        }
    };

    // Ambil data artikel jika mode Edit
    useEffect(() => {
        if (!isEdit || !postSlug) return;

        const fetchPostForEdit = async () => {
            setLoadingPost(true);
            try {
                const response = await axiosInstance.get(API_PATHS.POSTS.GET_BY_SLUG(postSlug));
                if (response.data?.success && response.data.post) {
                    const p = response.data.post;
                    setPostId(p._id);
                    setTitle(p.title || "");
                    setSlug(p.slug || "");
                    if (DEFAULT_CATEGORIES.includes(p.category)) {
                        setCategory(p.category);
                    } else if (p.category) {
                        setCategory("Lainnya");
                        setCustomCategory(p.category);
                    }
                    setSummary(p.summary || "");
                    setContent(p.content || "");
                    setCoverImageUrl(p.coverImageUrl || "");
                    setTags(p.tags || []);
                    setIsDraft(Boolean(p.isDraft));
                } else {
                    toast.error("Artikel tidak ditemukan.");
                    navigate("/admin/posts");
                }
            } catch (err) {
                console.error("Gagal memuat artikel untuk diedit:", err.message);
                toast.error("Gagal memuat artikel.");
                navigate("/admin/posts");
            } finally {
                setLoadingPost(false);
            }
        };

        fetchPostForEdit();
    }, [isEdit, postSlug, navigate]);

    // Handle Upload Cover Image
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB.");
            return;
        }

        setUploadingImage(true);
        try {
            const res = await uploadImage(file);
            if (res.imageUrl) {
                setCoverImageUrl(res.imageUrl);
                toast.success("Gambar cover berhasil diunggah!");
            }
        } catch (err) {
            toast.error(err.message || "Gagal mengunggah gambar.");
        } finally {
            setUploadingImage(false);
        }
    };

    // Handle Tambah Tag
    const handleAddTag = (rawTag) => {
        const cleanTag = rawTag.trim().replace(/^#/, "");
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags((prev) => [...prev, cleanTag]);
            setTagInput("");
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags((prev) => prev.filter((t) => t !== tagToRemove));
    };

    // AI Callbacks
    const handleApplyDraft = (draftData) => {
        if (draftData.title) setTitle(draftData.title);
        if (draftData.content) setContent(draftData.content);
        if (draftData.summary) setSummary(draftData.summary);
        if (draftData.tags && Array.isArray(draftData.tags)) {
            setTags((prev) => Array.from(new Set([...prev, ...draftData.tags])));
        }
        if (!slug && draftData.title) {
            const autoSlug = draftData.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            setSlug(autoSlug);
        }
    };

    const handleApplyTitleAndSlug = (selectedTitle, suggestedSlug) => {
        setTitle(selectedTitle);
        if (suggestedSlug) setSlug(suggestedSlug);
    };

    const handleApplySummary = (newSummary) => {
        setSummary(newSummary);
    };

    const handleInsertText = (textToInsert) => {
        setContent((prev) => (prev ? `${prev}\n\n${textToInsert}` : textToInsert));
    };

    // Submit Handler (Simpan Draft atau Terbitkan)
    const handleSubmit = async (asDraft = false) => {
        if (!title.trim()) {
            toast.error("Judul artikel tidak boleh kosong.");
            return;
        }

        if (!content.trim()) {
            toast.error("Konten artikel tidak boleh kosong.");
            return;
        }

        const finalCategory =
            category === "Lainnya" ? customCategory.trim() || "General" : category;

        const payload = {
            title: title.trim(),
            slug: slug.trim() || undefined,
            category: finalCategory,
            summary: summary.trim(),
            content,
            coverImageUrl: coverImageUrl.trim(),
            tags,
            isDraft: asDraft,
        };

        setSubmitting(true);
        try {
            let response;
            if (isEdit && (postId || postSlug)) {
                const targetId = postId || postSlug;
                response = await axiosInstance.put(API_PATHS.POSTS.UPDATE(targetId), payload);
            } else {
                response = await axiosInstance.post(API_PATHS.POSTS.CREATE, payload);
            }

            if (response.data?.success) {
                toast.success(
                    asDraft
                        ? "Artikel berhasil disimpan sebagai Draft!"
                        : isEdit
                        ? "Artikel berhasil diperbarui!"
                        : "Artikel berhasil dipublikasikan!"
                );
                navigate("/admin/posts");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menyimpan artikel.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeMenu="Tulis Artikel">
            {loadingPost ? (
                /* Skeleton Loader saat memuat data edit */
                <div className="space-y-6 animate-pulse">
                    <div className="w-48 h-8 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="w-full h-12 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="w-full h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
            ) : (
                <div className="space-y-8 pb-20">
                    {/* Header Top Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-slate-800 pb-5">
                        <div className="space-y-1">
                            <Link
                                to="/admin/posts"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                            >
                                <LuArrowLeft className="text-sm" /> Kembali ke Daftar Artikel
                            </Link>
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {isEdit ? "Perbarui Artikel" : "Tulis Artikel Baru"}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                {isEdit
                                    ? "Edit konten, metadata, atau status publikasi artikel Anda."
                                    : "Gunakan Markdown editor dan bantuan AI untuk menulis artikel berkualitas tinggi."}
                            </p>
                        </div>

                        {/* Action Buttons Top Bar */}
                        <div className="flex items-center flex-wrap gap-2.5">
                            {/* Gemini AI Assistant Button */}
                            <button
                                type="button"
                                onClick={() => setOpenAiDrawer(true)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-linear-to-r from-purple-50 via-indigo-50 to-sky-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-sky-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/60 text-xs font-bold transition-all cursor-pointer shadow-xs"
                                title="Buka Asisten AI"
                            >
                                <LuSparkles className="text-sm text-purple-600 dark:text-purple-400 animate-pulse" />
                                <span>Bantuan AI</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSubmit(true)}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                <LuFileText className="text-sm text-gray-500 dark:text-slate-400" />
                                <span>{submitting ? "Menyimpan..." : "Simpan Draft"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 hover:shadow-lg hover:shadow-sky-500/25 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                                <LuCheck className="text-sm" />
                                <span>
                                    {submitting
                                        ? "Memproses..."
                                        : isEdit
                                        ? "Perbarui & Publikasikan"
                                        : "Publikasikan Sekarang"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Main Form Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Kiri: Judul, Markdown Editor, Summary (Lebar 2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Input Judul */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                        Judul Artikel <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenAiDrawer(true)}
                                        className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <LuSparkles className="text-xs" /> Saran Judul AI
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Contoh: Panduan Lengkap Membangun Rest API dengan Express & MongoDB"
                                    className="w-full text-base md:text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none border-b border-gray-200 dark:border-slate-700 focus:border-sky-500 pb-2 transition-colors bg-transparent"
                                />
                                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400 dark:text-slate-500">
                                    <span>Gunakan judul yang ringkas, jelas, dan menarik perhatian pembaca.</span>
                                    <span>{title.length} karakter</span>
                                </div>
                            </div>

                            {/* Rich Text Markdown Editor */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                        Konten Artikel (Markdown) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setOpenAiDrawer(true)}
                                            className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-2.5 py-1 rounded-lg transition-colors border border-purple-100 dark:border-purple-800/50"
                                        >
                                            <LuSparkles className="text-xs" /> Tulis dengan AI
                                        </button>
                                        <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-800/50">
                                            Markdown & GFM
                                        </span>
                                    </div>
                                </div>

                                <div data-color-mode={isDarkMode ? "dark" : "light"} className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                                    <MDEditor
                                        value={content}
                                        onChange={(val) => setContent(val || "")}
                                        height={480}
                                        preview="live"
                                        textareaProps={{
                                            placeholder: "Mulai tulis artikel Anda di sini menggunakan sintaks Markdown...",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Ringkasan / Summary (Excerpt SEO) */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                        Ringkasan Singkat (Summary / SEO Excerpt)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenAiDrawer(true)}
                                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <LuSparkles className="text-xs" /> Buat Ringkasan AI
                                    </button>
                                </div>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={3}
                                    placeholder="Tuliskan 1-2 kalimat ringkasan yang menjelaskan inti artikel untuk cuplikan kartu dan optimasi SEO..."
                                    className="w-full text-xs md:text-sm text-gray-800 dark:text-slate-100 bg-gray-50/70 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                />
                                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
                                    <span>Akan ditampilkan di kartu artikel beranda.</span>
                                    <span>{summary.length} karakter</span>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Cover Image, Kategori, Slug, Tags (Lebar 1/3) */}
                        <div className="space-y-6">
                            {/* 1. Cover Thumbnail Image */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                    Gambar Cover Artikel
                                </label>

                                {coverImageUrl ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group aspect-16/9 bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={getValidImageUrl(coverImageUrl)}
                                            alt="Cover Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCoverImageUrl("")}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                                                title="Hapus gambar"
                                            >
                                                <LuTrash2 className="text-sm" /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-3 hover:border-sky-400 transition-colors">
                                        <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/60 text-sky-500 rounded-full flex items-center justify-center mx-auto text-xl border border-sky-100 dark:border-sky-800/40">
                                            <LuImage />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                                                Unggah gambar cover
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                                                PNG, JPG, WEBP hingga 5MB
                                            </p>
                                        </div>

                                        <label className="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors border border-sky-100 dark:border-sky-800/40">
                                            <LuUpload className="text-sm" />
                                            <span>{uploadingImage ? "Mengunggah..." : "Pilih File"}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}

                                {/* Atau Masukkan URL Gambar Manual */}
                                <div className="space-y-1 pt-1">
                                    <span className="text-[11px] text-gray-400 dark:text-slate-500">Atau tempel URL gambar langsung:</span>
                                    <input
                                        type="url"
                                        value={coverImageUrl}
                                        onChange={(e) => setCoverImageUrl(e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800"
                                    />
                                </div>
                            </div>

                            {/* 2. Kategori */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                    Kategori Artikel
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full text-xs md:text-sm text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 cursor-pointer"
                                >
                                    {DEFAULT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                    <option value="Lainnya">+ Kategori Kustom</option>
                                </select>

                                {category === "Lainnya" && (
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder="Ketik nama kategori kustom..."
                                        className="w-full text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800"
                                    />
                                )}
                            </div>

                            {/* 3. Custom Slug URL */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                    Slug URL Kustom
                                </label>
                                <div className="flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-500 dark:text-slate-400 focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-slate-800">
                                    <span className="text-gray-400 select-none">/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                        placeholder="judul-artikel-anda"
                                        className="w-full bg-transparent text-gray-800 dark:text-slate-100 outline-none pl-1"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                                    URL publik: <span className="text-sky-600 dark:text-sky-400 font-mono">/{slug || "slug-artikel"}</span>
                                </p>
                            </div>

                            {/* 4. Tags Topik */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                    Tag Topik
                                </label>

                                {/* Tag Input Box */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Ketik tag lalu tekan Enter..."
                                        className="flex-1 text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag(tagInput)}
                                        className="bg-gray-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-gray-200 dark:border-slate-700"
                                        title="Tambah tag"
                                    >
                                        <LuPlus className="text-sm" />
                                    </button>
                                </div>

                                {/* Active Tags List */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {tags.map((t) => (
                                            <span
                                                key={t}
                                                className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60 text-xs px-2.5 py-1 rounded-lg"
                                            >
                                                #{t}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(t)}
                                                    className="hover:text-red-500 cursor-pointer"
                                                >
                                                    <LuX className="text-xs" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Tag Rekomendasi Populer */}
                                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
                                    <span className="text-[11px] text-gray-400 dark:text-slate-500">Rekomendasi cepat:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTED_TAGS.map((stag) => (
                                            <button
                                                key={stag}
                                                type="button"
                                                onClick={() => handleAddTag(stag)}
                                                className="text-[10px] bg-gray-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                            >
                                                +{stag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 5. Status Info & Quick Preview Link */}
                            {isEdit && slug && (
                                <div className="bg-sky-50/50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="text-xs text-gray-600 dark:text-slate-300">
                                        <span className="font-semibold text-gray-800 dark:text-slate-200">Status: </span>
                                        {isDraft ? (
                                            <span className="text-amber-600 dark:text-amber-400 font-bold">Draft</span>
                                        ) : (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terpublikasi</span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/${slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                                    >
                                        <LuEye className="text-sm" /> Lihat Hasil
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Gemini AI Button */}
                    <FloatingAiButton onClick={() => setOpenAiDrawer(true)} />

                    {/* Sliding Gemini AI Writer Assistant Drawer */}
                    <AiWriterDrawer
                        isOpen={openAiDrawer}
                        onClose={() => setOpenAiDrawer(false)}
                        onApplyDraft={handleApplyDraft}
                        onApplyTitleAndSlug={handleApplyTitleAndSlug}
                        onApplySummary={handleApplySummary}
                        onInsertText={handleInsertText}
                        articleContext={{
                            title,
                            content,
                            tags,
                            category,
                        }}
                    />
                </div>
            )}
        </DashboardLayout>
    );
};

export default BlogPostEditor;
