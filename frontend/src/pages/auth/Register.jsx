import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import toast from "react-hot-toast";

import { auth } from "../../services/firebase";
import api from "../../services/api";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import logo from "../../utils/logo.png";

const schema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
    role: z.enum(["student", "alumni"], { required_error: "Select a role" }),
}).refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
});

const ROLE_DEFAULTS = {
    tpo: "/tpo/dashboard",
    student: "/student/feed",
    alumni: "/alumni/jobs",
};

const ROLE_OPTIONS = [
    { value: "student", label: "Student" },
    { value: "alumni", label: "Alumni" },
];

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async ({ full_name, email, password, role }) => {
        setLoading(true);
        try {
            // 1. Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { user } = userCredential;

            // 2. Set display name
            await updateProfile(user, { displayName: full_name });

            // 3. Register in MongoDB
            await api.post("/auth/verify", {
                firebase_uid: user.uid,
                email: user.email,
                role,
            });

            toast.success("Account created! Welcome to PlacementPro 🎓");
            navigate(ROLE_DEFAULTS[role] || "/");
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                toast.error("This email is already registered. Try logging in.");
            } else if (err.code === "auth/weak-password") {
                toast.error("Password is too weak. Use at least 8 characters.");
            } else {
                toast.error(err.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFCC00] p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mx-auto mb-6 p-1">
                            <img src={logo} alt="PlacementPro Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Create Account</h1>
                        <p className="font-bold tracking-widest text-xs uppercase text-gray-500 mt-1">Join PlacementPro today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Karthik Acharya"
                            error={errors.full_name?.message}
                            required
                            {...register("full_name")}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@college.edu.in"
                            error={errors.email?.message}
                            required
                            {...register("email")}
                        />
                        <Select
                            label="Role"
                            options={ROLE_OPTIONS}
                            placeholder="Select your role"
                            error={errors.role?.message}
                            required
                            {...register("role")}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Min. 8 characters"
                            error={errors.password?.message}
                            required
                            {...register("password")}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Re-enter password"
                            error={errors.confirm?.message}
                            required
                            {...register("confirm")}
                        />
                        <Button type="submit" className="w-full mt-2" loading={loading}>
                            Create account
                        </Button>
                    </form>

                    <p className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-black font-black hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
