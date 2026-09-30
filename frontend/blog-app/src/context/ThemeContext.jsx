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
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
            }
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
                return "dark";
            }
        }
        return "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        try {
            localStorage.setItem("theme", theme);
        } catch (e) {
            console.error("Failed to persist theme to localStorage", e);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
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
