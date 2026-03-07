import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../services/api";
import AppLayout from "../../components/layout/AppLayout";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

function DriveCard({ drive, onApply, applying }) {
    const criteria = drive.eligibility_criteria || {};
    // Mock match score if backend doesn't provide it yet
    const matchScore = drive.match_score ?? Math.floor(((drive._id?.charCodeAt(0) || 50) % 40) + 55);

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-black text-black text-xl uppercase tracking-wider">{drive.company_name}</h3>
                    <p className="font-bold text-gray-600 uppercase tracking-widest text-xs mt-1">{drive.role}</p>
                </div>
                <Badge label={drive.status} variant={drive.status} />
            </div>

            {drive.description && (
                <p className="text-sm font-medium text-black border-l-4 border-[#FFCC00] pl-3 py-1 my-2 line-clamp-2">{drive.description}</p>
            )}

            {/* Eligibility criteria chips */}
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="bg-gray-50 border-2 border-black rounded-md px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    Min CGPA: {criteria.min_cgpa}
                </span>
                <span className="bg-gray-50 border-2 border-black rounded-md px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    Max Backlogs: {criteria.max_backlogs}
                </span>
                {criteria.branches?.map((b) => (
                    <span key={b} className="bg-[#FFCC00] border-2 border-black rounded-md text-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                        {b}
                    </span>
                ))}
            </div>

            {drive.drive_date && (
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2 border-t-[2px] border-black border-dashed pt-4">
                    Drive Date: {new Date(drive.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            )}

            {/* Skill Match & Apply section */}
            <div className="mt-2 border-t-2 border-black border-dashed pt-4 flex flex-col gap-4">
                {/* Progress Bar */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-black">
                        <span>Profile Match</span>
                        <span className={matchScore > 75 ? "text-green-600" : "text-yellow-600"}>{matchScore}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 border-2 border-black rounded-full overflow-hidden shadow-inner flex items-center">
                        <div
                            className={`h-full ${matchScore > 75 ? 'bg-green-400' : 'bg-[#FFCC00]'} border-r-2 border-black animate-[pulse_2s_ease-in-out_infinite]`}
                            style={{ width: `${matchScore}%`, transition: "width 1s ease-in-out" }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {drive.drive_date ? (
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Date: {new Date(drive.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date TBD</p>
                    )}

                    {drive.has_applied ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Applied ✓</span>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            className="rounded-md"
                            loading={applying === drive._id}
                            onClick={() => onApply(drive._id)}
                        >
                            Apply Now
                        </Button>
                    )}
                </div>
            </div>
        </Card >
    );
}

export default function Feed() {
    const queryClient = useQueryClient();
    const [applyingId, setApplyingId] = useState(null);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["student-feed"],
        queryFn: () => api.get("/api/students/feed").then((r) => r.data),
    });

    const applyMutation = useMutation({
        mutationFn: (drive_id) => api.post("/api/applications", { drive_id }),
        onMutate: (drive_id) => setApplyingId(drive_id),
        onSuccess: () => {
            toast.success("Application submitted! ✅");
            queryClient.invalidateQueries({ queryKey: ["student-feed"] });
        },
        onError: (err) => {
            const msg = err.response?.data?.detail;
            if (err.response?.status === 409) {
                toast.error("You have already applied to this drive.");
            } else {
                toast.error(msg || "Failed to apply. Please try again.");
            }
        },
        onSettled: () => setApplyingId(null),
    });

    return (
        <AppLayout pageTitle="Live Feed">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight">Eligible Drives</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">
                            {data ? `${data.count} drive${data.count !== 1 ? "s" : ""} matching your profile` : "Loading your personalized feed..."}
                        </p>
                    </div>
                    {!isLoading && (
                        <Button variant="ghost" size="sm" onClick={refetch}>Refresh</Button>
                    )}
                </div>

                {isLoading && <SkeletonList count={3} height="h-44" />}

                {isError && (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 mb-4">Failed to load your feed.</p>
                        <Button variant="secondary" onClick={refetch}>Try Again</Button>
                    </div>
                )}

                {!isLoading && !isError && data?.drives?.length === 0 && (
                    <EmptyState
                        emoji="🔍"
                        title="No eligible drives right now"
                        subtitle="Complete your Resume Wizard so we can match you with upcoming drives."
                    />
                )}

                {!isLoading && !isError && data?.drives?.length > 0 && (
                    <div className="space-y-4">
                        {data.drives.map((drive) => (
                            <DriveCard
                                key={drive._id}
                                drive={drive}
                                applying={applyingId}
                                onApply={(id) => applyMutation.mutate(id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
