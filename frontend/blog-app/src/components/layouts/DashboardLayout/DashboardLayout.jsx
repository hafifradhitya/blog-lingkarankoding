import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuExternalLink, LuLogOut } from "react-icons/lu";
import SideMenu from "../SideMenu";
import CharAvatar from "../../Cards/CharAvatar";
import ThemeToggle from "../../Common/ThemeToggle";
import { useUser } from "../../../context/userContext";
import LogoBlack from "../../../assets/logo-black.png";
import LogoWhite from "../../../assets/logo-white.png";
import { getValidImageUrl } from "../../../utils/helper";

const DashboardLayout = ({ children, activeMenu }) => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
            {/* Admin Header Navbar */}
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
                <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
                    {/* Left: Mobile Toggle & Logo */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            className="block lg:hidden text-gray-700 dark:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                            onClick={() => setOpenSideMenu(!openSideMenu)}
                            aria-label="Toggle navigation menu"
                        >
                            {openSideMenu ? (
                                <HiOutlineX className="text-2xl" />
                            ) : (
                                <HiOutlineMenu className="text-2xl" />
                            )}
                        </button>

                        <Link to="/admin/dashboard" className="flex items-center gap-3">
                            {/* Light Mode Logo (Hitam) */}
                            <img
                                src={LogoBlack}
                                alt="Lingkaran Koding"
                                className="h-[24px] md:h-[28px] w-auto block dark:hidden"
                            />
                            {/* Dark Mode Logo (Putih) */}
                            <img
                                src={LogoWhite}
                                alt="Lingkaran Koding"
                                className="h-[24px] md:h-[28px] w-auto hidden dark:block"
                            />
                            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider bg-linear-to-r from-sky-500 to-cyan-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                                Admin Portal
                            </span>
                        </Link>
                    </div>

                    {/* Right: Theme Toggle, View Blog Site & User Profile */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Theme Toggle Button */}
                        <ThemeToggle />

                        <Link
                            to="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-gray-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700/80 border border-gray-200/70 dark:border-slate-700 px-3.5 py-2 rounded-xl transition-colors"
                        >
                            <span>Lihat Website</span>
                            <LuExternalLink className="text-sm" />
                        </Link>

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-gray-200 dark:border-slate-700"
                                >
                                    {user.profileImageUrl ? (
                                        <img
                                            src={getValidImageUrl(user.profileImageUrl)}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <CharAvatar
                                            fullName={user.name}
                                            width="w-8"
                                            height="h-8"
                                            style="text-xs"
                                        />
                                    )}
                                    <span className="hidden md:inline text-xs font-semibold text-gray-800 dark:text-slate-200 pr-2 max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {showUserDropdown && (
                                    <div
                                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-150"
                                        onClick={() => setShowUserDropdown(false)}
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-slate-400 truncate">
                                                {user.email}
                                            </p>
                                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                                                {user.role}
                                            </span>
                                        </div>

                                        <Link
                                            to="/"
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                        >
                                            <LuExternalLink className="text-sm" />
                                            Kunjungi Halaman Publik
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
                                        >
                                            <LuLogOut className="text-sm" />
                                            Keluar (Logout)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Body Content Area with Sticky SideMenu */}
            <div className="flex-1 flex">
                {/* Desktop Sticky SideMenu */}
                <aside className="hidden lg:block shrink-0">
                    <SideMenu activeMenu={activeMenu} />
                </aside>

                {/* Mobile Slide-Out SideMenu */}
                {openSideMenu && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                            onClick={() => setOpenSideMenu(false)}
                        ></div>
                        <div className="fixed top-[57px] bottom-0 left-0 bg-white dark:bg-slate-900 z-50 shadow-2xl">
                            <SideMenu
                                activeMenu={activeMenu}
                                onClose={() => setOpenSideMenu(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
