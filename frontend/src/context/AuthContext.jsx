import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import api from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Listens to Firebase onAuthStateChanged.
 * For existing users: fetches role from GET /auth/me.
 * For brand-new Google OAuth users: /auth/me returns 403 because they haven't
 *   been written to MongoDB yet. We set role to null and expose refreshRole()
 *   so Login.jsx can trigger a re-fetch after calling POST /auth/verify.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    // Fetch role — called both on auth-state change and manually by Login after /auth/verify
    const fetchRole = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setRole(data.role);
            return data.role;
        } catch (err) {
            // 403 = user authenticated via Firebase but not yet in MongoDB
            // (happens briefly during Google OAuth before /auth/verify is called)
            if (err.response?.status !== 403) {
                console.error("[AuthContext] Failed to fetch user role:", err.message);
            }
            setRole(null);
            return null;
        }
    }, []);

    // Exposed to consumers so Login/Register can trigger a role refresh
    // after calling POST /auth/verify
    const refreshRole = useCallback(async () => {
        return await fetchRole();
    }, [fetchRole]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchRole();
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchRole]);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
        queryClient.clear();
    };

    const value = { user, role, loading, logout, refreshRole };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthContext must be used within <AuthProvider>");
    }
    return ctx;
}

export default AuthContext;
