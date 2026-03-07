import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../services/api";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";

export default function Notifications() {
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [filterResults, setFilterResults] = useState({});   // driveId → result
    const [filterLoading, setFilterLoading] = useState(null);  // driveId currently filtering
    const [notifiedDrives, setNotifiedDrives] = useState(new Set()); // drives already notified

    // ── Fetch all TPO drives ─────────────────────────────────────────────────
    const { data: drivesData, isLoading } = useQuery({
        queryKey: ["tpo-drives"],
        queryFn: () => api.get("/api/drives").then((r) => r.data),
    });

    // ── Run criteria filter per drive ────────────────────────────────────────
    const runFilter = async (driveId) => {
        setFilterLoading(driveId);
        try {
            const { data } = await api.post(`/api/drives/${driveId}/filter`);
            setFilterResults((prev) => ({ ...prev, [driveId]: data }));
        } catch (err) {
            toast.error(err.response?.data?.detail || "Filter failed.");
        } finally {
            setFilterLoading(null);
        }
    };

    // ── Broadcast mutation ───────────────────────────────────────────────────
    const broadcastMutation = useMutation({
        mutationFn: ({ drive_id, student_ids }) =>
            api.post("/api/notifications/broadcast", { drive_id, student_ids }),
        onSuccess: (res, variables) => {
            toast.success(`📧 ${res.data.message}`);
            setNotifiedDrives((prev) => new Set([...prev, variables.drive_id]));
            setSelectedDrive(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || "Broadcast failed.");
        },
    });

    const handleBroadcast = () => {
        if (!selectedDrive) return;
        const result = filterResults[selectedDrive._id];
        if (!result?.students?.length) return;

        broadcastMutation.mutate({
            drive_id: selectedDrive._id,
            student_ids: result.students.map((s) => s.id),
        });
    };

    const drives = drivesData?.drives || [];

    return (
        <AppLayout pageTitle="Notifications">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-black tracking-tight mb-2">Notification Center</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Notify eligible students about placement drives via email
                    </p>
                </div>

                {isLoading && <SkeletonList count={3} height="h-32" />}

                {!isLoading && drives.length === 0 && (
                    <EmptyState
                        emoji="🔔"
                        title="No drives to notify about"
                        subtitle="Create some drives first in Drive Manager."
                    />
                )}

                {!isLoading && drives.length > 0 && (
                    <div className="space-y-6">
                        {drives.map((drive) => {
                            const result = filterResults[drive._id];
                            const eligibleCount = result?.eligible_count ?? null;
                            const isPublished = drive.published === true;
                            const alreadyNotified = notifiedDrives.has(drive._id);

                            return (
                                <div key={drive._id} className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 focus-within:shadow-[4px_4px_0px_0px_#000] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-black text-xl uppercase tracking-wider text-black">
                                                {drive.company_name}
                                            </h3>
                                            <p className="font-bold text-gray-500 uppercase tracking-widest text-xs mt-1">{drive.role}</p>
                                            {drive.drive_date && (
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">
                                                    Drive Date: {new Date(drive.drive_date).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge label={drive.status} variant={drive.status} />
                                            <span
                                                className={`text-xs font-black uppercase tracking-wider px-3 py-1 border-[2px] border-black ${isPublished
                                                    ? "bg-green-400 text-black shadow-[2px_2px_0px_0px_#000]"
                                                    : "bg-white text-black shadow-[2px_2px_0px_0px_#000]"
                                                    }`}
                                            >
                                                {isPublished ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t-[3px] border-black border-dashed flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Run Filter */}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                loading={filterLoading === drive._id}
                                                onClick={() => runFilter(drive._id)}
                                            >
                                                🔍 Find Eligible Students
                                            </Button>

                                            {/* Show count */}
                                            {eligibleCount !== null && (
                                                <span className="text-sm font-black uppercase tracking-wider text-[#FFCC00] bg-black px-3 py-1">
                                                    {eligibleCount} eligible
                                                </span>
                                            )}
                                        </div>

                                        {/* Notify button */}
                                        {alreadyNotified ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-green-600 border-2 border-green-600 px-3 py-1.5 bg-green-50 shadow-[2px_2px_0px_0px_#16a34a]">
                                                ✅ Notified
                                            </span>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                disabled={!eligibleCount || eligibleCount === 0}
                                                onClick={() => setSelectedDrive(drive)}
                                            >
                                                📧 Notify All Eligible
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal open={!!selectedDrive} onClose={() => setSelectedDrive(null)}>
                {selectedDrive && (
                    <div className="max-w-md mx-auto p-4 border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_#000]">
                        <div className="text-center mb-6">
                            <span className="text-6xl mb-4 block">📧</span>
                            <h2 className="text-2xl font-black uppercase tracking-wider text-black">Confirm Broadcast</h2>
                        </div>
                        <p className="text-sm font-bold text-gray-600 text-center mb-6 px-4 bg-gray-100 py-3 border-l-[4px] border-[#FFCC00]">
                            Send email notifications to{" "}
                            <strong className="text-black font-black text-lg block my-1">
                                {filterResults[selectedDrive._id]?.eligible_count || 0} students
                            </strong>{" "}
                            about <strong className="text-black font-black uppercase">{selectedDrive.company_name} — {selectedDrive.role}</strong>?
                        </p>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#E53955] text-center mb-6 border-2 border-[#E53955] p-2 bg-red-50">
                            Emails will be sent from the TPO account via n8n automation.
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-4 mt-8 pt-4 border-t-[3px] border-black">
                            <Button
                                variant="secondary"
                                className="flex-1 py-3"
                                onClick={() => setSelectedDrive(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 py-3 bg-[#E53955] border-black shadow-[4px_4px_0px_0px_#000]"
                                loading={broadcastMutation.isPending}
                                onClick={handleBroadcast}
                            >
                                Send Notifications
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
