import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import api from "../../services/api";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";

// ── Zod schema ────────────────────────────────────────────────────────────────
const driveSchema = z.object({
    company_name: z.string().min(1, "Company name is required").max(100),
    role: z.string().min(1, "Role is required").max(100),
    description: z.string().max(2000).optional(),
    status: z.enum(["Active", "Upcoming", "Closed"]),
    drive_date: z.string().refine((v) => !isNaN(Date.parse(v)), { message: "Enter a valid date" }),
    min_cgpa: z.coerce.number().min(0).max(10),
    max_backlogs: z.coerce.number().int().min(0),
    branches: z.string().min(1, "Enter at least one branch (comma-separated)"),
});

// ── Criteria Engine sub-component ─────────────────────────────────────────────
function CriteriaResult({ driveId }) {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runFilter = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/api/drives/${driveId}/filter`);
            setResult(data);
            setOpen(true);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Filter failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
                <Button size="sm" variant="secondary" loading={loading} onClick={runFilter}>
                    🔍 Run Filter
                </Button>
                {result && (
                    <span className="text-sm font-semibold text-primary-700">
                        {result.eligible_count} eligible student{result.eligible_count !== 1 ? "s" : ""}
                    </span>
                )}
            </div>
            {result && result.eligible_count > 0 && (
                <div className="mt-2">
                    <button
                        onClick={() => setOpen((p) => !p)}
                        className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                    >
                        {open ? "▲ Collapse" : "▼ Show students"}
                    </button>
                    {open && (
                        <div className="mt-2 rounded-lg border border-gray-100 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="text-left px-3 py-2">Name</th>
                                        <th className="text-left px-3 py-2">Branch</th>
                                        <th className="text-left px-3 py-2">CGPA</th>
                                        <th className="text-left px-3 py-2">Backlogs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {result.students.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-800">{s.full_name}</td>
                                            <td className="px-3 py-2 text-gray-500">{s.branch}</td>
                                            <td className="px-3 py-2 text-gray-500">{s.cgpa}</td>
                                            <td className="px-3 py-2 text-gray-500">{s.backlogs}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Applications panel (TPO sees who applied) ────────────────────────────────
function ApplicationsPanel({ driveId }) {
    const [open, setOpen] = useState(false);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["drive-applications", driveId],
        queryFn: () => api.get(`/api/applications/drive/${driveId}`).then((r) => r.data),
        enabled: open,
    });
    const [updatingId, setUpdatingId] = useState(null);

    const handleStatusChange = async (appId, newStatus) => {
        setUpdatingId(appId);
        try {
            await api.patch(`/api/applications/${appId}/status`, { status: newStatus });
            toast.success(`Status → ${newStatus}`);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to update.");
        } finally {
            setUpdatingId(null);
        }
    };

    const count = data?.count ?? null;

    return (
        <div className="mt-3 pt-3 border-t border-gray-100">
            <button
                onClick={() => setOpen((p) => !p)}
                className="text-xs text-primary-600 hover:underline flex items-center gap-1"
            >
                {open ? "▲ Hide Applications" : `📋 View Applications${count !== null ? ` (${count})` : ""}`}
            </button>
            {open && isLoading && <p className="text-xs text-gray-400 mt-2 animate-pulse">Loading…</p>}
            {open && data && data.count === 0 && (
                <p className="text-xs text-gray-400 mt-2 italic">No applications yet for this drive.</p>
            )}
            {open && data && data.count > 0 && (
                <div className="mt-2 rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="text-left px-3 py-2">Student</th>
                                <th className="text-left px-3 py-2">Branch</th>
                                <th className="text-left px-3 py-2">CGPA</th>
                                <th className="text-left px-3 py-2">Applied</th>
                                <th className="text-left px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {data.applications.map((a) => (
                                <tr key={a._id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <span className="font-medium text-gray-800">{a.student_name}</span>
                                        <span className="block text-[10px] text-gray-400">{a.student_email}</span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{a.student_branch}</td>
                                    <td className="px-3 py-2 text-gray-500">{a.student_cgpa}</td>
                                    <td className="px-3 py-2 text-gray-400">{new Date(a.applied_on).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={a.status}
                                            disabled={updatingId === a._id}
                                            onChange={(e) => handleStatusChange(a._id, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded-md border font-medium ${a.status === "Selected" ? "bg-green-50 text-green-700 border-green-200" :
                                                a.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                                                    a.status === "Shortlisted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        "bg-gray-50 text-gray-700 border-gray-200"
                                                }`}
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Selected">Selected</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ── Drive card with publish toggle ────────────────────────────────────────────
function DriveCard({ drive, onPublishToggle, publishingId }) {
    const isPublished = drive.published === true;
    return (
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 focus-within:shadow-[4px_4px_0px_0px_#000] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-black text-xl uppercase tracking-wider text-black">{drive.company_name}</h3>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs mt-1">{drive.role}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge label={drive.status} variant={drive.status} />
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 border-[2px] border-black ${isPublished ? "bg-green-400 text-black shadow-[2px_2px_0px_0px_#000]" : "bg-white text-black shadow-[2px_2px_0px_0px_#000]"}`}>
                        {isPublished ? "📢 Published" : "📝 Draft"}
                    </span>
                </div>
            </div>
            {drive.drive_date && (
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">
                    Drive Date: {new Date(drive.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            )}

            {/* Publish / Unpublish */}
            <div className="mt-4 pt-4 border-t-[3px] border-black border-dashed flex items-center justify-between">
                <Button
                    size="sm"
                    variant={isPublished ? "danger" : "primary"}
                    loading={publishingId === drive._id}
                    onClick={() => onPublishToggle(drive._id)}
                >
                    {isPublished ? "Unpublish" : "📢 Publish"}
                </Button>
                {isPublished && (
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 border-2 border-green-600 px-2 py-1 bg-green-50">Visible</span>
                )}
            </div>

            <CriteriaResult driveId={drive._id} />
            <ApplicationsPanel driveId={drive._id} />
        </div>
    );
}


// ── Main component ────────────────────────────────────────────────────────────
export default function DriveManager() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [publishingId, setPublishingId] = useState(null);

    const { data: drivesData, isLoading } = useQuery({
        queryKey: ["tpo-drives"],
        queryFn: () => api.get("/api/drives").then((r) => r.data),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(driveSchema), defaultValues: { status: "Upcoming", min_cgpa: 6.0, max_backlogs: 0 } });

    // Create drive
    const createMutation = useMutation({
        mutationFn: (payload) => api.post("/api/drives", payload),
        onSuccess: () => {
            toast.success("Drive created! 🏢");
            queryClient.invalidateQueries({ queryKey: ["tpo-drives"] });
            reset();
            setShowForm(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || "Failed to create drive.");
        },
    });

    // Publish toggle
    const handlePublishToggle = async (driveId) => {
        setPublishingId(driveId);
        try {
            const { data } = await api.patch(`/api/drives/${driveId}/publish`);
            toast.success(data.published ? "Drive published! Students can now see it." : "Drive unpublished.");
            queryClient.invalidateQueries({ queryKey: ["tpo-drives"] });
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to update visibility.");
        } finally {
            setPublishingId(null);
        }
    };

    const onSubmit = (values) => {
        const { branches, min_cgpa, max_backlogs, drive_date, ...rest } = values;
        createMutation.mutate({
            ...rest,
            drive_date: new Date(drive_date).toISOString(),
            eligibility_criteria: {
                min_cgpa: Number(min_cgpa),
                max_backlogs: Number(max_backlogs),
                branches: branches.split(",").map((b) => b.trim().toUpperCase()).filter(Boolean),
            },
        });
    };

    return (
        <AppLayout pageTitle="Drive Manager">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Drive Manager</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                            {drivesData ? `${drivesData.count} total drives` : ""}
                        </p>
                    </div>
                    <Button onClick={() => setShowForm((p) => !p)}>
                        {showForm ? "Cancel" : "+ Create Drive"}
                    </Button>
                </div>

                {/* Create drive form */}
                {showForm && (
                    <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-8 mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-black mb-2">New Placement Drive</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 bg-gray-100 p-3 border-l-4 border-[#FFCC00]">
                            💡 Drives are saved as <strong>Draft</strong> — students won't see it until you publish it.
                        </p>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Company Name" error={errors.company_name?.message} required {...register("company_name")} />
                                <Input label="Role" error={errors.role?.message} required {...register("role")} />
                            </div>
                            <Input label="Description (optional)" error={errors.description?.message} {...register("description")} />
                            <div className="grid grid-cols-3 gap-4">
                                <Input label="Min CGPA" type="number" step="0.1" min="0" max="10" error={errors.min_cgpa?.message} required {...register("min_cgpa")} />
                                <Input label="Max Backlogs" type="number" min="0" error={errors.max_backlogs?.message} required {...register("max_backlogs")} />
                                <Select label="Status" options={["Active", "Upcoming", "Closed"]} error={errors.status?.message} required {...register("status")} />
                            </div>
                            <Input
                                label="Eligible Branches (comma-separated)"
                                placeholder="CSE, ISE, ECE"
                                error={errors.branches?.message}
                                helperText="e.g. CSE, ISE, AI/ML"
                                required
                                {...register("branches")}
                            />
                            <Input label="Drive Date" type="datetime-local" error={errors.drive_date?.message} required {...register("drive_date")} />
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" loading={createMutation.isPending}>Create Drive</Button>
                                <Button type="button" variant="ghost" className="border-none shadow-none text-gray-400" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Drive list */}
                {isLoading && <SkeletonList count={3} height="h-44" />}
                {!isLoading && drivesData?.drives?.length === 0 && (
                    <EmptyState emoji="🏢" title="No drives yet" subtitle='Click "+ Create Drive" to create your first placement drive.' />
                )}
                {!isLoading && drivesData?.drives?.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {drivesData.drives.map((drive) => (
                            <DriveCard
                                key={drive._id}
                                drive={drive}
                                publishingId={publishingId}
                                onPublishToggle={handlePublishToggle}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
