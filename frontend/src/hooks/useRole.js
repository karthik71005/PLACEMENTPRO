import { useAuthContext } from "../context/AuthContext";

/**
 * useRole
 * Convenience hook to get only the current user's role.
 *
 * @returns {string|null} "tpo" | "student" | "alumni" | null
 */
export function useRole() {
    const { role } = useAuthContext();
    return role;
}
