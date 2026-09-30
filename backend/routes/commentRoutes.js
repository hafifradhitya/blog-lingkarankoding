const express = require("express");
const router = express.Router();
const {
    addComment,
    getPostComments,
    deleteComment,
    getAllCommentsAdmin,
    getMyComments,
} = require("../controllers/commentController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Rute Publik
router.get("/post/:postId", getPostComments);

// Rute Private (User Login)
router.post("/", protect, addComment);
router.get("/user/my-comments", protect, getMyComments);

// Rute Private (Khusus Admin)
router.get("/admin/all", protect, adminOnly, getAllCommentsAdmin);

// Rute Hapus Komentar
router.delete("/:id", protect, deleteComment);

module.exports = router;
