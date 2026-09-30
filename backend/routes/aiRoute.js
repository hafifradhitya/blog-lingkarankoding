const express = require("express");
const router = express.Router();
const {
    generateDraft,
    generateTitleAndSlug,
    generateSummary,
    checkSeo,
    rewriteText,
    chatAssistant,
} = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

// Semua endpoint AI diproteksi dengan otentikasi (hanya pengguna login)
router.post("/generate-draft", protect, generateDraft);
router.post("/generate-title", protect, generateTitleAndSlug);
router.post("/generate-summary", protect, generateSummary);
router.post("/seo-check", protect, checkSeo);
router.post("/rewrite", protect, rewriteText);
router.post("/chat", protect, chatAssistant);

module.exports = router;
