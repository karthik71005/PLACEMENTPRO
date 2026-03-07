import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./ui/Spinner";

const ROLE_DEFAULTS = {
    tpo: "/tpo/dashboard",
    student: "/student/feed",
    alumni: "/alumni/jobs",
};

/**
 * ProtectedRoute
 *
 * @param {string[]} allowedRoles - Roles permitted to access the wrapped route.
 *   If empty, any authenticated user is allowed.
 *
 * Behaviour:
 *   - Loading → full-screen spinner
 *   - Not authenticated → redirect to /login
 *   - Wrong role → redirect to role's default route
 *   - Correct role → render children
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" className="text-primary-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User authenticated but role not yet resolved
    // (happens briefly during Google OAuth before /auth/verify completes)
    if (role === null && allowedRoles.length > 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" className="text-primary-600" />
            </div>
        );
    }

    // Firebase user exists but hasn't picked a role yet → send to Register
    if (role === "pending") {
        return <Navigate to="/register" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        const fallback = ROLE_DEFAULTS[role] || "/login";
        return <Navigate to={fallback} replace />;
    }

    return children;
}
