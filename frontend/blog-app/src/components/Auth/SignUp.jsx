import { useState } from "react";
import { useUser } from "../../context/userContext";
import { uploadImage } from "../../utils/uploadImage";
import { LuUser, LuMail, LuEye, LuEyeOff, LuCamera } from "react-icons/lu";
import toast from "react-hot-toast";

const SignUp = ({ onSuccess, onSwitchToLogin }) => {
    const { register } = useUser();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran foto maksimal 5MB.");
                return;
            }
            setProfileImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!name.trim() || !email.trim() || !password) {
            setErrorMsg("Nama, email, dan password wajib diisi.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password minimal 6 karakter.");
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedImageUrl = null;
            if (profileImageFile) {
                const uploadRes = await uploadImage(profileImageFile);
                uploadedImageUrl = uploadRes.imageUrl;
            }

            const result = await register({
                name: name.trim(),
                email: email.trim(),
                password,
                bio: bio.trim(),
                profileImageUrl: uploadedImageUrl,
            });

            if (result.success) {
                if (onSuccess) onSuccess(result.user);
            } else {
                setErrorMsg(result.message || "Gagal melakukan registrasi.");
            }
        } catch (err) {
            setErrorMsg(err.message || "Gagal mengunggah foto profil.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-5">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Akun Baru</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Bergabung bersama komunitas Lingkaran Koding
                </p>
            </div>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs rounded-xl">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Profile Picture Upload Preview */}
                <div className="flex flex-col items-center justify-center mb-3">
                    <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-sky-400 p-0.5 overflow-hidden group bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <LuUser className="text-2xl text-gray-400 dark:text-slate-500" />
                        )}

                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <LuCamera className="text-lg" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Unggah Foto (Opsional)</span>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Nama Lengkap</label>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            required
                        />
                        <LuUser className="text-gray-400 dark:text-slate-500 text-lg my-auto" />
                    </div>
                </div>

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

                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Bio Singkat (Opsional)</label>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Frontend developer, enthusiast AI..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
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
                            <span>Mendaftarkan...</span>
                        </div>
                    ) : (
                        "Daftar Sekarang"
                    )}
                </button>
            </form>

            <div className="mt-5 text-center text-xs text-gray-500 dark:text-slate-400">
                Sudah memiliki akun?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sky-500 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                >
                    Masuk di sini
                </button>
            </div>
        </div>
    );
};

export default SignUp;
