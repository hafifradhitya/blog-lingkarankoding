import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import { HiOutlineX } from "react-icons/hi";

const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
    const [view, setView] = useState(initialView);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100 dark:border-slate-800 transition-colors">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors cursor-pointer"
                    aria-label="Tutup Modal"
                >
                    <HiOutlineX className="text-lg" />
                </button>

                {view === "login" ? (
                    <Login
                        onSuccess={() => onClose()}
                        onSwitchToSignUp={() => setView("signup")}
                    />
                ) : (
                    <SignUp
                        onSuccess={() => onClose()}
                        onSwitchToLogin={() => setView("login")}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthModal;
