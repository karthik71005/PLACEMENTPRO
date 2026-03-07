import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";

const jobSchema = z.object({
    company: z.string().min(1, "Company is required").max(100),
    role: z.string().min(1, "Role is required").max(100),
    location: z.string().max(100).optional(),
    job_link: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
    referral_notes: z.string().max(1000).optional(),
});

export default function JobBoard() {
    const { role } = useAuth();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const isAlumni = role === "alumni";

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["job-referrals"],
        queryFn: () => api.get("/api/alumni/jobs").then((r) => r.data),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(jobSchema) });

    const createMutation = useMutation({
        mutationFn: (payload) => api.post("/api/alumni/jobs", payload),
        onSuccess: () => {
            toast.success("Job referral posted! 🎉");
            queryClient.invalidateQueries({ queryKey: ["job-referrals"] });
            setShowModal(false);
            reset();
        },
        onError: (err) => toast.error(err.response?.data?.detail || "Failed to post job."),
    });

    const onSubmit = (data) => createMutation.mutate(data);
    const jobs = data?.jobs || [];

    return (
        <AppLayout pageTitle="Job Referral Board">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Job Referral Board</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {isAlumni ? "Share job opportunities with students" : "Explore referral opportunities from alumni"}
                        </p>
                    </div>
                    {isAlumni && (
                        <Button onClick={() => setShowModal(true)}>
                            + Post a Job
                        </Button>
                    )}
                </div>

                {/* Loading */}
                {isLoading && <SkeletonList count={3} height="h-28" />}

                {/* Error */}
                {isError && (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 mb-4">Failed to load referrals.</p>
                        <button onClick={refetch} className="text-sm text-primary-600 hover:underline">Try Again</button>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && jobs.length === 0 && (
                    <EmptyState
                        emoji="💼"
                        title="No referrals yet"
                        subtitle={isAlumni ? "Be the first to post a job referral!" : "Check back soon — alumni will post opportunities here."}
                    />
                )}

                {/* Job cards */}
                {jobs.length > 0 && (
                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <div key={job._id} className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 focus-within:shadow-[4px_4px_0px_0px_#000] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all">
                                <div className="flex items-start justify-between gap-3 border-b-[3px] border-black pb-4 mb-4">
                                    <div>
                                        <h3 className="font-black text-2xl uppercase tracking-wider text-black leading-none mb-1">{job.role}</h3>
                                        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">{job.company}{job.location ? ` • ${job.location}` : ""}</p>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider bg-[#FFCC00] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                                        {new Date(job.posted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </span>
                                </div>
                                {job.referral_notes && (
                                    <p className="text-sm font-medium text-black bg-gray-50 border-2 border-black p-4 mb-4">{job.referral_notes}</p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Posted by <span className="text-black">{job.alumni_name}</span></span>
                                    {job.job_link && (
                                        <a
                                            href={job.job_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-black uppercase tracking-wider text-white bg-black px-4 py-2 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors"
                                        >
                                            Apply →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Job Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Post a Job Referral">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Company *" error={errors.company?.message} {...register("company")} placeholder="e.g. Google" />
                    <Input label="Role *" error={errors.role?.message} {...register("role")} placeholder="e.g. SDE Intern" />
                    <Input label="Location" error={errors.location?.message} {...register("location")} placeholder="e.g. Bangalore" />
                    <Input label="Job Link" error={errors.job_link?.message} {...register("job_link")} placeholder="https://..." />
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">Referral Notes</label>
                        <textarea
                            {...register("referral_notes")}
                            rows={3}
                            className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all placeholder-gray-400"
                            placeholder="Any tips or referral code..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" loading={createMutation.isPending}>
                            Post Referral
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
