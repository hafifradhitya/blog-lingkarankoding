import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./context/userContext";
import { ThemeProvider } from "./context/ThemeContext";

import BlogLandingPage from "./pages/Blog/BlogLandingPage";
import BlogPostView from "./pages/Blog/BlogPostView";
import PostByTags from "./pages/Blog/PostByTags";
import SearchPosts from "./pages/Blog/SearchPosts";
import UserDashboard from "./pages/Blog/UserDashboard";
import AdminLogin from "./pages/Admin/AdminLogin";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Admin/Dashboard";
import BlogPosts from "./pages/Admin/BlogPosts";
import BlogPostEditor from "./pages/Admin/BlogPostEditor";
import Comments from "./pages/Admin/Comments";

const App = () => {
    return (
        <ThemeProvider>
            <UserProvider>
                <Router>
                    <Routes>
                        {/* Public Blog Routes */}
                        <Route path="/" element={<BlogLandingPage />} />
                        <Route path="/tag/:tagName" element={<PostByTags />} />
                        <Route path="/search" element={<SearchPosts />} />

                        {/* Protected User / Member Dashboard Route */}
                        <Route element={<PrivateRoute allowedRoles={["member", "admin"]} />}>
                            <Route path="/dashboard" element={<UserDashboard />} />
                        </Route>

                        {/* Detail Artikel Dinamis by Slug - Diletakkan setelah rute spesifik agar tidak tabrakan */}
                        <Route path="/:slug" element={<BlogPostView />} />

                        {/* Admin Portal Authentication */}
                        <Route path="/admin-login" element={<AdminLogin />} />

                        {/* Protected Admin Routes */}
                        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/admin/posts" element={<BlogPosts />} />
                            <Route path="/admin/create" element={<BlogPostEditor />} />
                            <Route
                                path="/admin/edit/:postSlug"
                                element={<BlogPostEditor isEdit={true} />}
                            />
                            <Route path="/admin/comments" element={<Comments />} />
                        </Route>
                    </Routes>
                </Router>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            fontSize: "13px",
                            borderRadius: "10px",
                            background: "#1e293b",
                            color: "#f8fafc",
                            border: "1px solid #334155",
                        },
                    }}
                />
            </UserProvider>
        </ThemeProvider>
    );
};

export default App;
