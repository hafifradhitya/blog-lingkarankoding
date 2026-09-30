const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const {
    getDraftPrompt,
    getTitleAndSlugPrompt,
    getSummaryPrompt,
    getSeoPrompt,
    getRewritePrompt,
    getAssistantSystemPrompt,
} = require("../utils/prompts");

// Inisialisasi client Gemini AI dengan auto-reload .env jika belum termuat
const getAiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        require("dotenv").config({ path: path.join(__dirname, "../.env") });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY pada file .env backend lalu restart server backend."
        );
    }
    return new GoogleGenAI({ apiKey });
};

// Model default Google Gemini (menggunakan alias resmi gemini-flash-latest yang aktif)
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

// Helper tangguh untuk memanggil Gemini AI dengan auto-fallback jika model utama sibuk (503)
const callGemini = async (prompt) => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (err) {
        const errMsg = err.message || "";
        if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand")) {
            console.warn(`⚠️ Model ${DEFAULT_MODEL} sedang sibuk (503). Mencoba fallback ke gemini-flash-lite-latest...`);
            const fallbackResponse = await ai.models.generateContent({
                model: "gemini-flash-lite-latest",
                contents: prompt,
            });
            return fallbackResponse.text;
        }
        throw err;
    }
};

// Helper untuk membersihkan dan mem-parsing output JSON dari Gemini AI
const parseJsonOutput = (text) => {
    if (!text) throw new Error("Output dari Gemini AI kosong.");

    // Hapus markdown code block ```json ... ``` jika ada
    let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        // Coba temukan substring JSON { ... } atau [ ... ]
        const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
            return JSON.parse(match[0]);
        }
        throw new Error("Gagal mengurai respon AI menjadi format data JSON.");
    }
};

// @desc    Generate draft artikel blog lengkap dari sebuah topik
// @route   POST /api/ai/generate-draft
// @access  Private (Memerlukan token login)
const generateDraft = async (req, res) => {
    try {
        const { topic, category, tone, language } = req.body;

        if (!topic || !topic.trim()) {
            return res.status(400).json({
                success: false,
                message: "Topik artikel wajib diisi.",
            });
        }

        const prompt = getDraftPrompt({ topic, category, tone, language });
        const rawText = await callGemini(prompt);
        const draftData = parseJsonOutput(rawText);

        return res.status(200).json({
            success: true,
            message: "Draft artikel berhasil dibuat oleh Gemini AI.",
            data: draftData,
        });
    } catch (err) {
        console.error("AI Generate Draft Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Gagal menghasilkan draft artikel dengan AI.",
        });
    }
};

// @desc    Generate rekomendasi Judul & Slug SEO-friendly
// @route   POST /api/ai/generate-title
// @access  Private (Memerlukan token login)
const generateTitleAndSlug = async (req, res) => {
    try {
        const { content, topic } = req.body;
        const textToAnalyze = content || topic;

        if (!textToAnalyze || !textToAnalyze.trim()) {
            return res.status(400).json({
                success: false,
                message: "Konten atau topik artikel wajib diisi untuk menghasilkan judul.",
            });
        }

        const prompt = getTitleAndSlugPrompt(textToAnalyze);
        const rawText = await callGemini(prompt);
        const parsed = parseJsonOutput(rawText);

        return res.status(200).json({
            success: true,
            suggestions: parsed.suggestions || [],
        });
    } catch (err) {
        console.error("AI Generate Title Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Gagal menghasilkan saran judul.",
        });
    }
};

// @desc    Generate Ringkasan / Excerpt otomatis dari konten artikel
// @route   POST /api/ai/generate-summary
// @access  Private (Memerlukan token login)
const generateSummary = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Konten artikel wajib diisi untuk membuat ringkasan.",
            });
        }

        const prompt = getSummaryPrompt(content);
        const rawText = await callGemini(prompt);
        const parsed = parseJsonOutput(rawText);

        return res.status(200).json({
            success: true,
            summary: parsed.summary || "",
            readingTimeMinutes: parsed.readingTimeMinutes || 1,
        });
    } catch (err) {
        console.error("AI Generate Summary Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Gagal membuat ringkasan otomatis.",
        });
    }
};

// @desc    SEO Checker & Rekomendasi Optimasi
// @route   POST /api/ai/seo-check
// @access  Private (Memerlukan token login)
const checkSeo = async (req, res) => {
    try {
        const { title, content, tags, focusKeyword } = req.body;

        if (!title && !content) {
            return res.status(400).json({
                success: false,
                message: "Judul atau konten artikel wajib diisi untuk audit SEO.",
            });
        }

        const prompt = getSeoPrompt({ title, content, tags, focusKeyword });
        const rawText = await callGemini(prompt);
        const analysis = parseJsonOutput(rawText);

        return res.status(200).json({
            success: true,
            analysis,
        });
    } catch (err) {
        console.error("AI SEO Check Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Gagal melakukan analisis SEO dengan AI.",
        });
    }
};

// @desc    Rewrite / Memperbaiki kualitas tulisan (Grammar, Tone, Panjang, Diksi)
// @route   POST /api/ai/rewrite
// @access  Private (Memerlukan token login)
const rewriteText = async (req, res) => {
    try {
        const { text, action, tone, language } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Teks yang ingin diperbaiki wajib diisi.",
            });
        }

        const prompt = getRewritePrompt({ text, action, tone, language });
        const rawText = await callGemini(prompt);
        const result = parseJsonOutput(rawText);

        return res.status(200).json({
            success: true,
            rewrittenText: result.rewrittenText,
            changesMade: result.changesMade,
        });
    } catch (err) {
        console.error("AI Rewrite Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Gagal memperbaiki teks dengan AI.",
        });
    }
};

// @desc    Chat Assistant untuk konsultasi penulis di halaman editor
// @route   POST /api/ai/chat
// @access  Private (Memerlukan token login)
const chatAssistant = async (req, res) => {
    try {
        const { message, articleContext = {} } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Pesan tidak boleh kosong.",
            });
        }

        const systemInstruction = getAssistantSystemPrompt(articleContext);
        const prompt = `${systemInstruction}\n\nPertanyaan Penulis: "${message.trim()}"\n\nJawaban Asisten:`;
        const reply = await callGemini(prompt);

        return res.status(200).json({
            success: true,
            reply,
        });
    } catch (err) {
        console.error("AI Chat Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Gagal berkomunikasi dengan AI Assistant.",
        });
    }
};

module.exports = {
    generateDraft,
    generateTitleAndSlug,
    generateSummary,
    checkSeo,
    rewriteText,
    chatAssistant,
};
