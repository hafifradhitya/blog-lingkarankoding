import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { LuShieldCheck, LuMail, LuEye, LuEyeOff, LuArrowLeft } from "react-icons/lu";
import toast from "react-hot-toast";

const AdminLogin = () => {
    const { login, isAuthenticated, isAdmin } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Jika sudah login sebagai admin, langsung redirect ke dashboard admin
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            const destination = location.state?.from?.pathname || "/admin/dashboard";
            navigate(destination, { replace: true });
        }
    }, [isAuthenticated, isAdmin, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim() || !password) {
            setErrorMsg("Email dan password administrator wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        const result = await login(email.trim(), password);
        setIsSubmitting(false);

        if (result.success) {
            if (result.user.role === "admin") {
                toast.success("Selamat datang di Portal Administrator!");
                navigate("/admin/dashboard", { replace: true });
            } else {
                setErrorMsg("Akses ditolak. Akun Anda tidak memiliki hak akses Administrator.");
                toast.error("Akun bukan Administrator.");
            }
        } else {
            setErrorMsg(result.message || "Email atau password admin salah.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/60 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-xl">
                {/* Back to Blog */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-sky-400 mb-6 transition-colors"
                >
                    <LuArrowLeft className="text-sm" /> Kembali ke Blog
                </Link>

                {/* Header Icon */}
                <div className="flex flex-col items-center text-center mb-7">
                    <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center text-sky-400 mb-3 shadow-lg shadow-sky-500/10">
                        <LuShieldCheck className="text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Masuk untuk mengelola seluruh konten, pengguna, dan analitik blog
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-slate-300">Email Administrator</label>
                        <div className="w-full flex justify-between gap-3 text-sm bg-slate-900/80 rounded-xl px-4 py-3 mb-2 mt-1.5 border border-slate-700 outline-none focus-within:border-sky-500 transition-colors">
                            <input
                                type="email"
                                placeholder="admin@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                                required
                            />
                            <LuMail className="text-slate-400 text-lg my-auto" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-300">Password</label>
                        <div className="w-full flex justify-between gap-3 text-sm bg-slate-900/80 rounded-xl px-4 py-3 mb-2 mt-1.5 border border-slate-700 outline-none focus-within:border-sky-500 transition-colors">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-200 my-auto cursor-pointer"
                            >
                                {showPassword ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-linear-to-r from-sky-500 to-cyan-500 py-3 rounded-xl transition-all hover:opacity-90 cursor-pointer shadow-lg shadow-sky-500/25 disabled:opacity-50 mt-4"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifikasi Akses...</span>
                            </div>
                        ) : (
                            "Masuk ke Dashboard"
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                    <p className="text-[11px] text-slate-500">
                        Lingkaran Koding • Secured Administrator Area
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
