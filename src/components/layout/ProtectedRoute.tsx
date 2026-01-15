import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "./PageLoader";

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    // If there is no user, redirect to the login page
    // We save the current location they were trying to go to so we can send them there after login
    if (!user) {
        // If trying to access protected routes without auth, redirect to auth with return url
        return <Navigate to={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // If valid user, show the child routes
    return <Outlet />;
};
