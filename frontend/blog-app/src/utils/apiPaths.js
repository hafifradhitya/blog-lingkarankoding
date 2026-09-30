export const BASE_URL =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        LOGIN: `${BASE_URL}/api/auth/login`,
        REGISTER: `${BASE_URL}/api/auth/register`,
        GET_PROFILE: `${BASE_URL}/api/auth/profile`,
        UPDATE_PROFILE: `${BASE_URL}/api/auth/profile`,
        UPLOAD_IMAGE: `${BASE_URL}/api/auth/upload-image`,
    },
    POSTS: {
        GET_ALL: `${BASE_URL}/api/posts`,
        CREATE: `${BASE_URL}/api/posts`,
        UPDATE: (id) => `${BASE_URL}/api/posts/${id}`,
        DELETE: (id) => `${BASE_URL}/api/posts/${id}`,
        GET_BY_SLUG: (slug) => `${BASE_URL}/api/posts/slug/${slug}`,
        GET_BY_TAG: (tag) => `${BASE_URL}/api/posts/tag/${tag}`,
        SEARCH: `${BASE_URL}/api/posts/search`,
        INCREMENT_VIEW: (id) => `${BASE_URL}/api/posts/${id}/view`,
        LIKE: (id) => `${BASE_URL}/api/posts/${id}/like`,
        TRENDING: `${BASE_URL}/api/posts/trending`,
        CATEGORIES: `${BASE_URL}/api/posts/categories`,
        BOOKMARKS: `${BASE_URL}/api/posts/user/bookmarks`,
        TOGGLE_BOOKMARK: (id) => `${BASE_URL}/api/posts/${id}/bookmark`,
        LIKED: `${BASE_URL}/api/posts/user/liked`,
    },
    COMMENTS: {
        ADD: `${BASE_URL}/api/comments`,
        GET_ALL: `${BASE_URL}/api/comments/admin/all`,
        ADMIN_ALL: `${BASE_URL}/api/comments/admin/all`,
        GET_BY_POST: (postId) => `${BASE_URL}/api/comments/post/${postId}`,
        MY_COMMENTS: `${BASE_URL}/api/comments/user/my-comments`,
        DELETE: (id) => `${BASE_URL}/api/comments/${id}`,
    },
    DASHBOARD: {
        USER_SUMMARY: `${BASE_URL}/api/dashboard/summary`,
        MY_POSTS: `${BASE_URL}/api/dashboard/my-posts`,
        ADMIN_SUMMARY: `${BASE_URL}/api/dashboard/admin/summary`,
        ADMIN_USERS: `${BASE_URL}/api/dashboard/admin/users`,
        UPDATE_USER_ROLE: (id) => `${BASE_URL}/api/dashboard/admin/users/${id}/role`,
        DELETE_USER: (id) => `${BASE_URL}/api/dashboard/admin/users/${id}`,
    },
    AI: {
        GENERATE_DRAFT: `${BASE_URL}/api/ai/generate-draft`,
        GENERATE_TITLE: `${BASE_URL}/api/ai/generate-title`,
        GENERATE_SUMMARY: `${BASE_URL}/api/ai/generate-summary`,
        SEO_CHECK: `${BASE_URL}/api/ai/seo-check`,
        REWRITE: `${BASE_URL}/api/ai/rewrite`,
        CHAT: `${BASE_URL}/api/ai/chat`,
    },
};
