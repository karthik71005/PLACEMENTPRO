import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import toast from "react-hot-toast";

import { auth } from "../../services/firebase";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import logo from "../../utils/logo.png";

const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const ROLE_DEFAULTS = {
    tpo: "/tpo/dashboard",
    student: "/student/feed",
    alumni: "/alumni/jobs",
};

export default function Login() {
    const navigate = useNavigate();
    const { refreshRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) });

    // After sign-in: refresh role from /auth/me then navigate
    const redirectAfterLogin = async () => {
        const role = await refreshRole();
        navigate(ROLE_DEFAULTS[role] || "/");
    };

    const onSubmit = async ({ email, password }) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            await redirectAfterLogin();
        } catch (err) {
            const msg =
                err.code === "auth/invalid-credential"
                    ? "Invalid email or password."
                    : err.message;
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            // Register in MongoDB (idempotent — /auth/verify upserts by firebase_uid)
            await api.post("/auth/verify", {
                firebase_uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: "student",
            });
            // Now /auth/me will succeed — refresh role and navigate
            await redirectAfterLogin();
        } catch (err) {
            toast.error(err.message || "Google sign-in failed.");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFCC00] p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mx-auto mb-6 p-1">
                            <img src={logo} alt="PlacementPro Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Welcome back</h1>
                        <p className="font-bold tracking-widest text-xs uppercase text-gray-500 mt-1">Sign in to PlacementPro</p>
                    </div>

                    {/* Email/Password form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@college.edu.in"
                            error={errors.email?.message}
                            required
                            {...register("email")}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            required
                            {...register("password")}
                        />
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full" loading={loading}>
                            Sign in
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google OAuth */}
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        loading={googleLoading}
                        onClick={handleGoogle}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>

                    {/* Register link */}
                    <p className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 mt-6">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-black font-black hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
