import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-md animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
}
