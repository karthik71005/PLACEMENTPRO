import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ref, onValue, off } from "firebase/database";

import api from "../../services/api";
import { database } from "../../services/firebase";
import AppLayout from "../../components/layout/AppLayout";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import StepperProgress from "../../components/ui/StepperProgress";

const APPLICATION_STEPS = ["Applied", "Shortlisted", "Selected"];

function trackerStepIndex(status) {
    if (status === "Rejected") return null;
    const idx = APPLICATION_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
}

/**
 * ApplicationCard with Firebase Realtime DB listener.
 * When the TPO updates the application status, the badge and stepper
 * update live without the student needing to reload the page.
 */
function ApplicationCard({ application }) {
    const [liveStatus, setLiveStatus] = useState(application.status);

    // ── Firebase RTDB listener for live updates ──────────────────────────────
    useEffect(() => {
        const appId = application._id;
        if (!appId) return;

        const dbRef = ref(database, `/application_updates/${appId}`);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const val = snapshot.val();
            if (val?.status && val.status !== liveStatus) {
                setLiveStatus(val.status);
            }
        });

        return () => off(dbRef, "value", unsubscribe);
    }, [application._id, liveStatus]);

    const { drive } = application;
    const isRejected = liveStatus === "Rejected";
    const currentStep = isRejected
        ? APPLICATION_STEPS.indexOf("Shortlisted")
        : trackerStepIndex(liveStatus);

    return (
        <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="font-black text-xl uppercase tracking-wider text-black">
                        {drive?.company_name || "Unknown Company"}
                    </h3>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs mt-1">{drive?.role || ""}</p>
                </div>
                <Badge label={liveStatus} variant={liveStatus} />
            </div>

            <StepperProgress
                steps={APPLICATION_STEPS}
                currentStep={currentStep}
                rejectedAt={isRejected ? APPLICATION_STEPS.indexOf("Shortlisted") : null}
            />

            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest border-t-[2px] border-black border-dashed pt-4">
                Applied:{" "}
                {new Date(application.applied_on).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </p>
        </Card>
    );
}

export default function Tracker() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["student-tracker"],
        queryFn: () => api.get("/api/students/tracker").then((r) => r.data),
    });

    return (
        <AppLayout pageTitle="Application Tracker">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-black text-black tracking-tight">My Applications</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">
                        {data ? `${data.count} application${data.count !== 1 ? "s" : ""}` : ""}
                    </p>
                    <p className="text-xs font-bold text-green-600 mt-2 p-2 border-2 border-green-600 inline-block bg-green-50 shadow-[2px_2px_0px_0px_#16a34a]">
                        <span className="animate-pulse">🟢</span> Status updates appear live — no need to refresh
                    </p>
                </div>

                {isLoading && <SkeletonList count={3} height="h-40" />}

                {isError && (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 mb-4">Failed to load your applications.</p>
                        <button onClick={refetch} className="text-sm text-primary-600 hover:underline">
                            Try Again
                        </button>
                    </div>
                )}

                {!isLoading && !isError && data?.applications?.length === 0 && (
                    <EmptyState
                        emoji="📋"
                        title="No applications yet"
                        subtitle="Explore the Live Feed to find and apply to eligible drives."
                    />
                )}

                {!isLoading && !isError && data?.applications?.length > 0 && (
                    <div className="space-y-4">
                        {data.applications.map((app) => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
