import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ROLE_DEFAULTS = {
    tpo: "/tpo/dashboard",
    student: "/student/feed",
    alumni: "/alumni/jobs",
};

export function Page404() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light text-center p-6">
            <p className="text-8xl font-extrabold text-primary-500 mb-2">404</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
            <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
            <Link to="/" className="text-primary-600 hover:underline font-medium text-sm">
                ← Go home
            </Link>
        </div>
    );
}

export function Page403() {
    const { role } = useAuth();
    const home = ROLE_DEFAULTS[role] || "/login";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light text-center p-6">
            <p className="text-8xl font-extrabold text-danger mb-2">403</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
            <p className="text-gray-500 mb-8">You don't have permission to view this page.</p>
            <Link to={home} className="text-primary-600 hover:underline font-medium text-sm">
                ← Go to your dashboard
            </Link>
        </div>
    );
}
