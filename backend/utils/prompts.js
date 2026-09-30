// Template prompt terstruktur untuk integrasi Google Gemini AI

/**
 * Prompt untuk generate draft artikel lengkap dari sebuah topik
 */
const getDraftPrompt = ({ topic, category = "General", tone = "informatif dan menarik", language = "Bahasa Indonesia" }) => {
    return `Anda adalah seorang Content Writer profesional dan pakar SEO.
Tugas Anda adalah menulis draft artikel blog berkualitas tinggi dalam ${language} berdasarkan topik berikut:
Topik: "${topic}"
Kategori: "${category}"
Gaya Penulisan / Tone: "${tone}"

Berikan respon HANYA dalam format JSON valid (tanpa teks pengantar) dengan struktur persis seperti berikut:
{
  "title": "Judul artikel yang menarik dan SEO friendly",
  "slug": "slug-artikel-seo-friendly",
  "summary": "Ringkasan padat dan menarik sekitar 2-3 kalimat (maksimal 300 karakter) untuk deskripsi meta dan card blog",
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "# Judul Artikel\\n\\nParagraf pembuka...\\n\\n## Sub-judul 1...\\n\\nKonten detail (gunakan format Markdown rapi dengan headings, bullet points, dan blok kode jika relevan)...\\n\\n## Kesimpulan\\n\\nRingkasan penutup..."
}`;
};

/**
 * Prompt untuk generate variasi judul & slug otomatis dari konten artikel
 */
const getTitleAndSlugPrompt = (content) => {
    return `Anda adalah seorang Headline Specialist dan copywriter ahli.
Analisa konten artikel berikut dan buatkan 5 pilihan judul yang sangat menarik (High Click-Through Rate), memancing rasa penasaran, relevan, serta ramah SEO beserta slug-nya.

Konten Artikel (potongan):
"""
${content.slice(0, 3000)}
"""

Berikan respon HANYA dalam format JSON valid:
{
  "suggestions": [
    {
      "title": "Pilihan Judul 1",
      "slug": "pilihan-judul-1",
      "type": "Click-worthy / Listicle / How-to / dsb"
    },
    {
      "title": "Pilihan Judul 2",
      "slug": "pilihan-judul-2",
      "type": "SEO Optimized"
    },
    {
      "title": "Pilihan Judul 3",
      "slug": "pilihan-judul-3",
      "type": "Storytelling / Engaging"
    },
    {
      "title": "Pilihan Judul 4",
      "slug": "pilihan-judul-4",
      "type": "Direct & Clear"
    },
    {
      "title": "Pilihan Judul 5",
      "slug": "pilihan-judul-5",
      "type": "Question / Curiosity"
    }
  ]
}`;
};

/**
 * Prompt untuk membuat ringkasan / excerpt otomatis
 */
const getSummaryPrompt = (content) => {
    return `Anda adalah seorang editor naskah.
Buatkan ringkasan (excerpt / meta description) padat, jelas, dan menarik dari konten artikel berikut dalam 1-2 paragraf pendek (maksimal 200 kata) dalam Bahasa Indonesia.

Konten Artikel:
"""
${content.slice(0, 3500)}
"""

Berikan respon HANYA dalam format JSON valid:
{
  "summary": "Teks ringkasan artikel di sini...",
  "readingTimeMinutes": 3
}`;
};

/**
 * Prompt untuk SEO Checker & Suggestion
 */
const getSeoPrompt = ({ title = "", content = "", tags = [], focusKeyword = "" }) => {
    return `Anda adalah seorang Senior SEO Specialist.
Lakukan audit SEO mendalam terhadap artikel blog berikut:
Judul: "${title}"
Focus Keyword: "${focusKeyword || "Ditentukan otomatis dari konten"}"
Tags: [${tags.join(", ")}]

Konten Artikel (potongan):
"""
${content.slice(0, 4000)}
"""

Berikan analisa dan rekomendasi dalam format JSON valid:
{
  "seoScore": 85,
  "readabilityScore": "Mudah Dibaca / Sedang / Sulit",
  "focusKeywordDetected": "keyword utama",
  "strengths": [
    "Kelebihan SEO 1",
    "Kelebihan SEO 2"
  ],
  "improvements": [
    "Saran perbaikan 1",
    "Saran perbaikan 2"
  ],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"],
  "metaTitleSuggestion": "Saran meta title jika judul saat ini kurang optimal",
  "metaDescriptionSuggestion": "Saran meta description optimal (150-160 karakter)"
}`;
};

/**
 * Prompt untuk rewrite / perbaiki tulisan
 */
const getRewritePrompt = ({ text, action = "improve", tone = "profesional", language = "Bahasa Indonesia" }) => {
    const actionInstructions = {
        improve: "Perbaiki tata bahasa, tanda baca, pilihan kata (diksi), dan keterbacaan agar lebih mengalir dan natural.",
        expand: "Kembangkan dan perluas penjelasan ini dengan argumen atau contoh yang relevan tanpa berbelit-belit.",
        shorten: "Persingkat dan padatkan kalimat menjadi lebih to-the-point tanpa menghilangkan inti pesan.",
        simplify: "Sederhanakan kalimat agar lebih mudah dipahami oleh pembaca pemula / umum.",
        professional: "Ubah gaya bahasa menjadi lebih formal, otoritatif, dan profesional.",
        casual: "Ubah gaya bahasa menjadi lebih santai, ramah, dan komunikatif.",
    };

    const instruction = actionInstructions[action] || actionInstructions.improve;

    return `Anda adalah seorang editor tulisan profesional.
Tugas: ${instruction}
Gaya penulisan yang diinginkan: "${tone}"
Bahasa: ${language}

Teks Asli:
"""
${text}
"""

Berikan respon HANYA dalam format JSON valid:
{
  "rewrittenText": "Hasil tulisan yang sudah diperbaiki...",
  "changesMade": "Ringkasan singkat apa saja yang diperbaiki..."
}`;
};

/**
 * System prompt untuk AI Chat Assistant di halaman editor
 */
const getAssistantSystemPrompt = (articleContext = {}) => {
    return `Anda adalah "Koding AI Assistant", asisten penulis blog pintar untuk website Lingkaran Koding.
Keahlian Anda:
- Membantu penulis melakukan brainstorming ide topik dan outline artikel.
- Memberikan saran struktur artikel teknis maupun non-teknis.
- Menjelaskan konsep pemrograman atau teknologi secara sederhana.
- Membantu menyusun kode contoh yang bersih dan rapi.
- Menjawab pertanyaan penulis dengan ramah, komunikatif, dan berbasis data.

Konteks artikel saat ini yang sedang dikerjakan penulis:
- Judul: "${articleContext.title || "Belum ada judul"}"
- Kategori: "${articleContext.category || "Belum ditentukan"}"
- Cuplikan Konten: "${(articleContext.content || "").slice(0, 1500)}"

Berikan jawaban yang ringkas, terstruktur menggunakan Markdown, dan langsung dapat diaplikasikan oleh penulis.`;
};

module.exports = {
    getDraftPrompt,
    getTitleAndSlugPrompt,
    getSummaryPrompt,
    getSeoPrompt,
    getRewritePrompt,
    getAssistantSystemPrompt,
};
