import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import toast from "react-hot-toast";

import { auth } from "../../services/firebase";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const schema = z.object({
    email: z.string().email("Enter a valid email"),
});

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async ({ email }) => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
            toast.success("Reset email sent! Check your inbox.");
        } catch (err) {
            toast.error(err.message || "Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFCC00] p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-8 md:p-12">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#FFCC00] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold">P</span>
                        </div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Reset Password</h1>
                        <p className="font-bold tracking-widest text-xs uppercase text-gray-500 mt-1">
                            Enter your email and we'll send a reset link.
                        </p>
                    </div>

                    {sent ? (
                        <div className="text-center py-6">
                            <span className="text-4xl text-black font-black uppercase tracking-widest">📬</span>
                            <p className="mt-4 text-sm font-bold text-black border-2 border-dashed border-black p-4">
                                A password reset link has been sent to your email. Please check your inbox (and spam folder).
                            </p>
                            <Link
                                to="/login"
                                className="mt-6 inline-block text-xs font-bold text-black uppercase tracking-wider hover:underline"
                            >
                                ← Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@college.edu.in"
                                error={errors.email?.message}
                                required
                                {...register("email")}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Send reset link
                            </Button>
                            <Link
                                to="/login"
                                className="block text-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-black mt-4 hover:underline"
                            >
                                ← Back to sign in
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
