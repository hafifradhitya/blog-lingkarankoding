const express = require("express");
const router = express.Router();
const {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getPostBySlug,
    getPostsByTag,
    searchPosts,
    incrementView,
    likePost,
    getTopPosts,
    getCategories,
    toggleBookmark,
    getBookmarkedPosts,
    getLikedPosts,
} = require("../controllers/blogPostController");
const { protect } = require("../middlewares/authMiddleware");

// Rute Publik Khusus (diletakkan sebelum rute berparameter umum)
router.get("/trending", getTopPosts);
router.get("/categories", getCategories);
router.get("/search", searchPosts);
router.get("/tag/:tag", getPostsByTag);
router.get("/slug/:slug", getPostBySlug);

// Rute Bookmark & Like Pengguna (Private)
router.get("/user/bookmarks", protect, getBookmarkedPosts);
router.get("/user/liked", protect, getLikedPosts);

// Rute CRUD Artikel
router.get("/", getAllPosts);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Rute Interaksi (View, Like, & Bookmark)
router.post("/:id/view", incrementView);
router.post("/:id/like", protect, likePost);
router.post("/:id/bookmark", protect, toggleBookmark);

module.exports = router;