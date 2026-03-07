import { useAuthContext } from "../context/AuthContext";

/**
 * useAuth
 * Returns the authenticated user object and related state.
 *
 * @returns {{ user: object|null, role: string|null, loading: boolean, logout: function }}
 */
export function useAuth() {
    return useAuthContext();
}
