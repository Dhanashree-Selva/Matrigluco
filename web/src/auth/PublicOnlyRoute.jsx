import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function PublicOnlyRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-md animate-spin" />
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
}
