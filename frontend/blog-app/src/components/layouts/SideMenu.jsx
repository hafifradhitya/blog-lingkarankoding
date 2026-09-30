import { BLOG_NAVBAR_DATA, SIDE_MENU_DATA } from "../../utils/data";
import { LuLogOut, LuTag } from "react-icons/lu";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/userContext";
import CharAvatar from "../Cards/CharAvatar";
import ThemeToggle from "../Common/ThemeToggle";
import LogoBlack from "../../assets/logo-black.png";
import LogoWhite from "../../assets/logo-white.png";

const SideMenu = ({ activeMenu, isBlogMenu, customCategories, onClose }) => {
    const { user, logout, isAuthenticated } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get("category");

    const handleClick = (route) => {
        if (onClose) onClose();
        if (route === "logout") {
            handleLogout();
            return;
        }
        navigate(route);
    };

    const handleLogout = () => {
        if (onClose) onClose();
        logout();
        navigate("/");
    };

    const menuItems = isBlogMenu ? (customCategories || BLOG_NAVBAR_DATA) : SIDE_MENU_DATA;

    const isItemActive = (item) => {
        if (isBlogMenu) {
            if (item.category === "All") {
                return (!currentCategory || currentCategory === "All") && location.pathname === "/";
            }
            return (
                (item.category && currentCategory?.toLowerCase() === item.category.toLowerCase()) ||
                activeMenu === item.label
            );
        }
        return activeMenu === item.label;
    };

    return (
        <div className="w-64 h-[calc(100vh-61px)] bg-white dark:bg-slate-900 border-r border-gray-200/50 dark:border-slate-800 p-5 sticky top-[61px] z-20 flex flex-col justify-between transition-colors duration-200">
            {/* Bagian Atas: Brand Logo & Kategori Lengkap Vertikal */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Brand Logo Header di SideMenu */}
                <div className="flex items-center justify-center pb-4 mb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
                    <button
                        type="button"
                        onClick={() => handleClick("/")}
                        className="flex items-center cursor-pointer"
                        aria-label="Kembali ke Beranda"
                    >
                        {/* Light Mode Logo (Hitam) */}
                        <img
                            src={LogoBlack}
                            alt="Lingkaran Koding"
                            className="h-[22px] w-auto block dark:hidden"
                        />
                        {/* Dark Mode Logo (Putih) */}
                        <img
                            src={LogoWhite}
                            alt="Lingkaran Koding"
                            className="h-[22px] w-auto hidden dark:block"
                        />
                    </button>
                </div>

                {/* User Info Header jika sedang login */}
                {isAuthenticated && user && (
                    <div className="flex flex-col items-center justify-center gap-1 mt-1 mb-4 pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
                        {user?.profileImageUrl ? (
                            <img
                                src={user.profileImageUrl}
                                alt="Profile"
                                className="w-14 h-14 rounded-full object-cover shadow-xs border border-gray-200 dark:border-slate-700"
                            />
                        ) : (
                            <CharAvatar
                                fullName={user?.name || ""}
                                width="w-14"
                                height="h-14"
                                style="text-base"
                            />
                        )}

                        <div className="mt-1.5 text-center w-full px-2">
                            <h5 className="text-gray-900 dark:text-white font-semibold text-xs truncate">
                                {user.name}
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
                            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                                {user.role}
                            </span>
                        </div>
                    </div>
                )}

                {/* Label Kategori untuk Navigasi Blog */}
                {isBlogMenu && (
                    <div className="px-2 pb-2 shrink-0">
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                            Kategori Blog
                        </span>
                    </div>
                )}

                {/* Navigation Menu Items (Scrollable vertikal jika kategori sangat banyak) */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                    {menuItems.map((item, index) => {
                        const isActive = isItemActive(item);
                        const IconComponent = item.icon || LuTag;

                        return (
                            <button
                                key={`menu_${index}`}
                                className={`w-full flex items-center gap-3 text-[13px] font-medium py-2 px-3.5 rounded-xl transition-all cursor-pointer ${
                                    isActive
                                        ? "text-white bg-linear-to-r from-sky-500 to-cyan-500 shadow-md shadow-sky-500/20"
                                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                                }`}
                                onClick={() => handleClick(item.path)}
                            >
                                <IconComponent className="text-base shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions: Theme Toggle & Logout (Tetap pinned di bawah) */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 shrink-0">
                <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Tema Tampilan</span>
                    <ThemeToggle />
                </div>

                {isAuthenticated && (
                    <button
                        className="w-full flex items-center gap-3 text-[13px] font-medium py-2 px-3.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        onClick={handleLogout}
                    >
                        <LuLogOut className="text-base shrink-0" />
                        <span>Keluar (Logout)</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SideMenu;
