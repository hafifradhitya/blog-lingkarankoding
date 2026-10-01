import { useState, useEffect, useRef } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { LuSearch, LuUser, LuLogOut, LuLayoutDashboard, LuChevronDown } from "react-icons/lu";
import { BLOG_NAVBAR_DATA } from "../../../utils/data";
import { useUser } from "../../../context/userContext";
import AuthModal from "../../Auth/AuthModal";
import CharAvatar from "../../Cards/CharAvatar";
import LogoBlack from "../../../assets/logo-black.png";
import LogoWhite from "../../../assets/logo-white.png";
import SideMenu from "../SideMenu";
import ThemeToggle from "../../Common/ThemeToggle";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { getValidImageUrl } from "../../../utils/helper";

const BlogNavbar = ({ activeMenu }) => {
    const { user, isAuthenticated, isAdmin, logout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get("category");

    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);

    // Kategori dinamis lengkap (mengambil dari backend / fallback ke BLOG_NAVBAR_DATA)
    const [menuCategories, setMenuCategories] = useState(BLOG_NAVBAR_DATA);

    const categoryDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.POSTS.CATEGORIES);
                if (
                    isMounted &&
                    res.data?.success &&
                    Array.isArray(res.data.categories) &&
                    res.data.categories.length > 0
                ) {
                    // Simpan SEMUA kategori dinamis (tidak di-slice di sini agar SideMenu & Dropdown dapat data lengkap)
                    const dynamicItems = [
                        { id: "01", label: "Semua", category: "All", path: "/" },
                        ...res.data.categories.map((c, idx) => ({
                            id: `cat_${idx + 1}`,
                            label: c.name,
                            category: c.name,
                            path: `/?category=${encodeURIComponent(c.name)}`,
                        })),
                    ];
                    setMenuCategories(dynamicItems);
                }
            } catch {
                // Fallback otomatis menggunakan default BLOG_NAVBAR_DATA
            }
        };

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    // Tutup dropdown jika user klik di luar elemen dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target)
            ) {
                setOpenCategoryDropdown(false);
            }
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target)
            ) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Tutup dropdown otomatis saat pindah halaman atau ganti kategori
    useEffect(() => {
        setOpenCategoryDropdown(false);
        setShowUserDropdown(false);
    }, [location.pathname, currentCategory]);

    // Helper untuk mengecek apakah sebuah kategori sedang aktif
    const isCategoryActive = (item) => {
        if (item.category === "All") {
            return (
                (!currentCategory || currentCategory === "All") &&
                location.pathname === "/"
            );
        }
        return (
            (item.category &&
                currentCategory?.toLowerCase() === item.category.toLowerCase()) ||
            activeMenu === item.label
        );
    };

    // LOGIKA SOLUSI A: Top Categories + Dropdown "Lainnya ▾"
    // Tampilkan maksimal 4 item teratas di navbar desktop (misal: Semua + 3 kategori pertama)
    const MAX_VISIBLE = 4;
    const visibleCategories = menuCategories.slice(0, MAX_VISIBLE);
    const overflowCategories = menuCategories.slice(MAX_VISIBLE);
    const hasOverflow = overflowCategories.length > 0;

    // Jika salah satu kategori di dalam dropdown sedang aktif, tombol "Lainnya" otomatis aktif
    const isOverflowActive = overflowCategories.some((item) =>
        isCategoryActive(item)
    );

    return (
        <>
            <div className="bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/60 dark:border-slate-800 backdrop-blur-md py-3.5 px-4 md:px-8 sticky top-0 z-30 transition-colors duration-200">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    {/* Logo & Mobile Menu Toggle */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            className="block lg:hidden text-gray-800 dark:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                            onClick={() => setOpenSideMenu(!openSideMenu)}
                            aria-label="Toggle navigation menu"
                        >
                            {openSideMenu ? (
                                <HiOutlineX className="text-2xl" />
                            ) : (
                                <HiOutlineMenu className="text-2xl" />
                            )}
                        </button>

                        <Link to="/" className="flex items-center">
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
                        </Link>
                    </div>

                    {/* Desktop Navigation Links (Solusi A: Max 4 Visible + Dropdown Lainnya) */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        {visibleCategories.map((item) => {
                            if (item?.onlySideMenu) return null;
                            const isItemActive = isCategoryActive(item);

                            return (
                                <Link key={item.id} to={item.path}>
                                    <li className="text-[14px] text-gray-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium list-none relative group cursor-pointer transition-colors py-1">
                                        {item.label}
                                        <span
                                            className={`absolute inset-x-0 bottom-0 h-[2px] bg-sky-500 transition-all duration-300 origin-left ${
                                                isItemActive ? "scale-x-100" : "scale-x-0"
                                            } group-hover:scale-x-100`}
                                        ></span>
                                    </li>
                                </Link>
                            );
                        })}

                        {/* Dropdown "Lainnya ▾" jika kategori > MAX_VISIBLE */}
                        {hasOverflow && (
                            <div className="relative" ref={categoryDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setOpenCategoryDropdown((prev) => !prev)}
                                    className={`text-[14px] flex items-center gap-1.5 py-1 font-medium list-none relative group cursor-pointer transition-colors ${
                                        isOverflowActive
                                            ? "text-sky-600 dark:text-sky-400 font-semibold"
                                            : "text-gray-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                                    }`}
                                    aria-expanded={openCategoryDropdown}
                                    aria-haspopup="true"
                                >
                                    <span>Lainnya</span>
                                    <LuChevronDown
                                        className={`text-base transition-transform duration-200 ${
                                            openCategoryDropdown ? "rotate-180 text-sky-500" : ""
                                        }`}
                                    />
                                    <span
                                        className={`absolute inset-x-0 bottom-0 h-[2px] bg-sky-500 transition-all duration-300 origin-left ${
                                            isOverflowActive ? "scale-x-100" : "scale-x-0"
                                        } group-hover:scale-x-100`}
                                    ></span>
                                </button>

                                {/* Popover Menu Kategori Lainnya */}
                                {openCategoryDropdown && (
                                    <div className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3.5 py-1.5 border-b border-gray-100 dark:border-slate-800 mb-1">
                                            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                                Topik Lainnya
                                            </p>
                                        </div>

                                        <div className="max-h-80 overflow-y-auto custom-scrollbar px-1.5 space-y-0.5">
                                            {overflowCategories.map((item) => {
                                                const active = isCategoryActive(item);
                                                return (
                                                    <Link
                                                        key={item.id}
                                                        to={item.path}
                                                        onClick={() => setOpenCategoryDropdown(false)}
                                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                                            active
                                                                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold"
                                                                : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400"
                                                        }`}
                                                    >
                                                        <span className="truncate">{item.label}</span>
                                                        {active && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>

                    {/* Action Buttons: Search, ThemeToggle & User Auth */}
                    <div className="flex items-center gap-2.5 md:gap-4">
                        {/* Search Button */}
                        <button
                            className="text-gray-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            onClick={() => navigate("/search")}
                            title="Cari Artikel"
                            aria-label="Cari Artikel"
                        >
                            <LuSearch className="text-[20px]" />
                        </button>

                        {/* Theme Toggle Button */}
                        <ThemeToggle />

                        {isAuthenticated && user ? (
                            /* User Profile Badge & Dropdown */
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-gray-200 dark:border-slate-700"
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
                                    <span className="hidden sm:inline text-xs font-semibold text-gray-800 dark:text-slate-200 pr-2 max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                </button>

                                {/* User Dropdown Menu */}
                                {showUserDropdown && (
                                    <div
                                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-150"
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

                                        {isAdmin ? (
                                            <Link
                                                to="/admin/dashboard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                            >
                                                <LuLayoutDashboard className="text-base" />
                                                Admin Dashboard
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                            >
                                                <LuLayoutDashboard className="text-base" />
                                                Dashboard Saya
                                            </Link>
                                        )}

                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
                                        >
                                            <LuLogOut className="text-base" />
                                            Keluar (Logout)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Login / SignUp Button */
                            <button
                                className="flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-cyan-500 text-xs md:text-sm font-semibold text-white px-4 md:px-6 py-2 rounded-full hover:shadow-lg hover:shadow-sky-500/25 transition-all cursor-pointer"
                                onClick={() => setOpenAuthModal(true)}
                            >
                                <LuUser className="text-sm" />
                                <span>Login / SignUp</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Sidebar (Menerima SELURUH kategori tanpa batasan) */}
                    {openSideMenu && (
                        <div className="fixed top-[61px] left-0 bg-white dark:bg-slate-900 z-40 shadow-2xl">
                            <SideMenu
                                activeMenu={activeMenu}
                                isBlogMenu
                                customCategories={menuCategories}
                                onClose={() => setOpenSideMenu(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Interactive Authentication Modal */}
            <AuthModal
                isOpen={openAuthModal}
                onClose={() => setOpenAuthModal(false)}
            />
        </>
    );
};

export default BlogNavbar;
