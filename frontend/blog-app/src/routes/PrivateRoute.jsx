import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/userContext";

const PrivateRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useUser();
    const location = useLocation();

    // Tampilkan indikator loading saat status otentikasi sedang dicek
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-500 font-medium">Memeriksa hak akses...</p>
            </div>
        );
    }

    // Jika pengguna belum login sama sekali
    if (!user) {
        // Jika rute admin, arahkan ke /admin-login
        if (allowedRoles.includes("admin")) {
            return <Navigate to="/admin-login" state={{ from: location }} replace />;
        }
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Jika rute membutuhkan role tertentu dan role user tidak sesuai
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
