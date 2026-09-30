import { useState } from "react";
import { useUser } from "../../context/userContext";
import { LuMail, LuEye, LuEyeOff } from "react-icons/lu";

const Login = ({ onSuccess, onSwitchToSignUp }) => {
    const { login } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim() || !password) {
            setErrorMsg("Email dan password wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        const result = await login(email.trim(), password);
        setIsSubmitting(false);

        if (result.success) {
            if (onSuccess) onSuccess(result.user);
        } else {
            setErrorMsg(result.message || "Email atau password salah.");
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Selamat Datang Kembali</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Masuk ke akun Anda untuk membaca & menulis artikel
                </p>
            </div>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs rounded-xl">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Email Address</label>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            required
                        />
                        <LuMail className="text-gray-400 dark:text-slate-500 text-lg my-auto" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Password</label>
                    <div className="input-box">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 my-auto cursor-pointer"
                        >
                            {showPassword ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary mt-2 cursor-pointer disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        "Masuk Sekarang"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 dark:text-slate-400">
                Belum punya akun?{" "}
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="text-sky-500 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                >
                    Daftar di sini
                </button>
            </div>
        </div>
    );
};

export default Login;
