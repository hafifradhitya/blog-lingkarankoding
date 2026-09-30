import {
    LuLayoutDashboard,
    LuGalleryVerticalEnd,
    LuMessageSquareQuote,
    LuFilePlus,
    LuLayoutTemplate,
    LuTag,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },

    {
        id: "02",
        label: "Tulis Artikel",
        icon: LuFilePlus,
        path: "/admin/create",
    },

    {
        id: "03",
        label: "Blog Posts",
        icon: LuGalleryVerticalEnd,
        path: "/admin/posts",
    },

    {
        id: "04",
        label: "Comments",
        icon: LuMessageSquareQuote,
        path: "/admin/comments",
    },
];

export const BLOG_NAVBAR_DATA = [
    {
        id: "01",
        label: "Semua",
        category: "All",
        icon: LuLayoutTemplate,
        path: "/",
    },

    {
        id: "02",
        label: "Teknologi",
        category: "Teknologi",
        icon: LuTag,
        path: "/?category=Teknologi",
    },

    {
        id: "03",
        label: "Tutorial",
        category: "Tutorial",
        icon: LuTag,
        path: "/?category=Tutorial",
    },

    {
        id: "04",
        label: "Lifestyle",
        category: "Lifestyle",
        icon: LuTag,
        path: "/?category=Lifestyle",
    },
];