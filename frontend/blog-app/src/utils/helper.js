export const getInitials = (title) => {
    if (!title) return "";

    const words = title.trim().split(" ");
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        if (words[i]) initials += words[i][0];
    }

    return initials.toUpperCase();
};

export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

export const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordsCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordsCount / wordsPerMinute));
};

export const sanitizeExcerpt = (text, maxLength = 120) => {
    if (!text) return "";
    // Hapus format markdown header, bold, italic, link, dan image
    const cleaned = text
        .replace(/#+\s/g, "")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
        .replace(/\n+/g, " ")
        .trim();

    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.slice(0, maxLength) + "...";
};