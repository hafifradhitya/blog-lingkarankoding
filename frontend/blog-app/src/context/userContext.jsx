import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Ambil profil terbaru dari backend saat aplikasi pertama kali dimuat
    useEffect(() => {
        const fetchUserProfile = async () => {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                if (response.data?.success && response.data?.user) {
                    setUser(response.data.user);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }
            } catch (error) {
                console.error("Sesi telah kedaluwarsa:", error.message);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    // Fungsi Login
    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email,
                password,
            });

            if (response.data?.success) {
                const { token: userToken, user: userData } = response.data;
                localStorage.setItem("token", userToken);
                localStorage.setItem("user", JSON.stringify(userData));
                setToken(userToken);
                setUser(userData);
                toast.success(response.data.message || "Login berhasil!");
                return { success: true, user: userData };
            }
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Gagal melakukan login.";
            toast.error(message);
            return { success: false, message };
        }
    };

    // Fungsi Registrasi
    const register = async (formData) => {
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, formData);

            if (response.data?.success) {
                const { token: userToken, user: userData } = response.data;
                localStorage.setItem("token", userToken);
                localStorage.setItem("user", JSON.stringify(userData));
                setToken(userToken);
                setUser(userData);
                toast.success(response.data.message || "Registrasi berhasil!");
                return { success: true, user: userData };
            }
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Gagal melakukan registrasi.";
            toast.error(message);
            return { success: false, message };
        }
    };

    // Fungsi Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
        toast.success("Anda telah berhasil logout.");
    };

    // Fungsi Update User Profile State
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateUser,
                isAuthenticated: Boolean(user && token),
                isAdmin: user?.role === "admin",
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

/* eslint-disable-next-line react-refresh/only-export-components */
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser harus digunakan di dalam UserProvider.");
    }
    return context;
};

export default UserContext;
