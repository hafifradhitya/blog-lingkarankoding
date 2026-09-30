const express = require("express");
const router = express.Router();
const {
    getUserDashboardSummary,
    getMyPosts,
    getAdminDashboardSummary,
    getAdminUsers,
    updateUserRole,
    deleteUser,
} = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// --- Rute User Dashboard (Member & Admin) ---
router.get("/summary", protect, getUserDashboardSummary);
router.get("/my-posts", protect, getMyPosts);

// --- Rute Admin Dashboard & Management (Khusus Admin) ---
router.get("/admin/summary", protect, adminOnly, getAdminDashboardSummary);
router.get("/admin/users", protect, adminOnly, getAdminUsers);
router.put("/admin/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/admin/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
