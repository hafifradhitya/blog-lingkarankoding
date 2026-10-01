import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "light",
    isDarkMode: false,
    toggleTheme: () => {},
    setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            // Cek apakah pengguna pernah sengaja mengganti tema lewat tombol toggle
            const explicitChoice = localStorage.getItem("theme_user_chosen");
            if (explicitChoice === "light" || explicitChoice === "dark") {
                return explicitChoice;
            }
        }
        // Default selalu light mode untuk semua perangkat (laptop, hp, tablet)
        return "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const nextTheme = prevTheme === "dark" ? "light" : "dark";
            try {
                localStorage.setItem("theme_user_chosen", nextTheme);
                localStorage.setItem("theme", nextTheme);
            } catch (e) {
                console.error("Failed to persist theme to localStorage", e);
            }
            return nextTheme;
        });
    };

    const isDarkMode = theme === "dark";

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/* eslint-disable-next-line react-refresh/only-export-components */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export default ThemeContext;
