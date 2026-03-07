import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../services/api";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

// ── Time helpers ──────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM – 6 PM

function timeLabel(hour) {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${h}:00 ${ampm}`;
}

/** Given a date, return Mon–Fri of that week as Date objects */
function getWeekDays(anchorDate) {
    const d = new Date(anchorDate);
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon...6=Sat
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return Array.from({ length: 5 }, (_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        return day;
    });
}

/** Format date → "2026-03-03" (for storage) */
function toDateStr(d) {
    return d.toISOString().split("T")[0];
}

/** Format date → "Mon 03 Mar" (for display) */
function formatDayHeader(d) {
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

// ── Scheduler Component ───────────────────────────────────────────────────────
export default function Scheduler() {
    const queryClient = useQueryClient();
    const [students, setStudents] = useState([]);
    const [dragStudent, setDragStudent] = useState(null);
    const [filterLoading, setFilterLoading] = useState(false);
    const [driveId, setDriveId] = useState("");
    const [weekOffset, setWeekOffset] = useState(0); // 0 = drive week, +1 = next week, etc.

    // ── Fetch all drives for the dropdown ────────────────────────────────────
    const { data: drivesData } = useQuery({
        queryKey: ["tpo-drives"],
        queryFn: () => api.get("/api/drives").then((r) => r.data),
    });
    const drives = drivesData?.drives || [];
    const selectedDrive = drives.find((d) => d._id === driveId);

    // ── Compute the week dates from the drive date ───────────────────────────
    const weekDays = useMemo(() => {
        if (!selectedDrive?.drive_date) return [];
        const anchor = new Date(selectedDrive.drive_date);
        anchor.setDate(anchor.getDate() + weekOffset * 7);
        return getWeekDays(anchor);
    }, [selectedDrive, weekOffset]);

    // ── Fetch saved interviews for the selected drive ────────────────────────
    const { data: interviewsData } = useQuery({
        queryKey: ["interviews", driveId],
        queryFn: () => api.get(`/api/interviews?drive_id=${driveId}`).then((r) => r.data),
        enabled: !!driveId,
    });

    // Convert saved interviews to events format
    const events = useMemo(() => {
        if (!interviewsData?.interviews) return [];
        return interviewsData.interviews.map((i) => ({
            id: i._id,
            day: i.day,         // "2026-03-03" date string
            hour: i.hour,
            student: {
                id: i.student_id,
                full_name: i.student_name,
                branch: i.student_branch,
                cgpa: i.student_cgpa,
            },
        }));
    }, [interviewsData]);

    // ── Load applied students ───────────────────────────────────
    const loadStudents = async (id) => {
        const selectedId = id || driveId;
        if (!selectedId) return;
        setFilterLoading(true);
        try {
            const { data } = await api.get(`/api/applications/drive/${selectedId}`);
            const formattedStudents = (data.applications || []).map(app => ({
                id: app.student_id,
                full_name: app.student_name,
                branch: app.student_branch,
                cgpa: app.student_cgpa
            }));
            setStudents(formattedStudents);
            toast.success(`Found ${data.count} applied students.`);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to load students.");
        } finally {
            setFilterLoading(false);
        }
    };

    const handleDriveSelect = (e) => {
        const id = e.target.value;
        setDriveId(id);
        setStudents([]);
        setWeekOffset(0);
        if (id) loadStudents(id);
    };

    // ── Conflict detection ───────────────────────────────────────────────────
    const occupiedSlots = useMemo(() => {
        const map = new Map();
        events.forEach((e) => map.set(`${e.day}-${e.hour}`, e));
        return map;
    }, [events]);

    const isOccupied = useCallback(
        (dateStr, hour) => occupiedSlots.has(`${dateStr}-${hour}`),
        [occupiedSlots]
    );

    // ── Drag & drop → persist to backend ─────────────────────────────────────
    const handleDragStart = (student) => setDragStudent(student);

    const handleDrop = async (dateStr, hour) => {
        if (!dragStudent) return;
        if (isOccupied(dateStr, hour)) {
            toast.error("⛔ That slot is already booked!");
            setDragStudent(null);
            return;
        }
        if (!driveId) {
            toast.error("Select a drive first.");
            setDragStudent(null);
            return;
        }

        try {
            await api.post("/api/interviews", {
                drive_id: driveId,
                student_id: dragStudent.id,
                student_name: dragStudent.full_name,
                student_branch: dragStudent.branch || "",
                student_cgpa: dragStudent.cgpa || 0,
                day: dateStr,
                hour,
            });
            const dayLabel = new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
            toast.success(`✅ ${dragStudent.full_name} → ${dayLabel} ${timeLabel(hour)}`);
            queryClient.invalidateQueries({ queryKey: ["interviews", driveId] });
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to schedule.");
        } finally {
            setDragStudent(null);
        }
    };

    const removeEvent = async (eventId) => {
        try {
            await api.delete(`/api/interviews/${eventId}`);
            toast.success("Slot removed.");
            queryClient.invalidateQueries({ queryKey: ["interviews", driveId] });
        } catch {
            toast.error("Failed to remove slot.");
        }
    };

    const clearAll = async () => {
        if (!driveId) return;
        try {
            await api.delete(`/api/interviews/drive/${driveId}`);
            toast("Schedule cleared.", { icon: "🗑" });
            queryClient.invalidateQueries({ queryKey: ["interviews", driveId] });
        } catch {
            toast.error("Failed to clear schedule.");
        }
    };

    const driveDate = selectedDrive?.drive_date
        ? new Date(selectedDrive.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : null;

    return (
        <AppLayout pageTitle="Interview Scheduler">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Interview Scheduler</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            Drag students onto time slots to schedule interviews
                        </p>
                    </div>
                    {events.length > 0 && (
                        <Button variant="danger" size="sm" onClick={clearAll}>
                            🗑 Clear Schedule
                        </Button>
                    )}
                </div>

                {/* Drive selector */}
                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 mb-8">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-black uppercase tracking-wider text-black mb-2 block">
                                Select Drive
                            </label>
                            <select
                                value={driveId}
                                onChange={handleDriveSelect}
                                className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all bg-white"
                            >
                                <option value="">— Choose a drive —</option>
                                {drives.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.company_name} — {d.role}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {driveDate && (
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 pb-3 whitespace-nowrap border-b-2 border-black">
                                📅 Drive date: <strong className="text-black font-black">{driveDate}</strong>
                            </span>
                        )}
                        {filterLoading && (
                            <span className="text-xs font-bold uppercase tracking-widest text-[#FFCC00] animate-pulse pb-3 bg-black px-2">Loading…</span>
                        )}
                    </div>
                </div>

                {driveId && weekDays.length > 0 && (
                    <>
                        {/* Week navigation */}
                        <div className="flex items-center justify-center gap-6 mb-6">
                            <button
                                onClick={() => setWeekOffset((p) => p - 1)}
                                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-black bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                ← Prev Week
                            </button>
                            <span className="text-lg font-black uppercase tracking-wider text-black border-b-[3px] border-black px-4 py-1">
                                {formatDayHeader(weekDays[0])} — {formatDayHeader(weekDays[4])}
                            </span>
                            <button
                                onClick={() => setWeekOffset((p) => p + 1)}
                                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-black bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                Next Week →
                            </button>
                            {weekOffset !== 0 && (
                                <button
                                    onClick={() => setWeekOffset(0)}
                                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#E53955] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ml-4"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            {/* ── Left sidebar: student chips ──────────────────────── */}
                            <div className="col-span-3">
                                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 sticky top-4">
                                    <h3 className="text-xl font-black uppercase tracking-wider text-black mb-4 border-b-[3px] border-black pb-2">
                                        Students ({students.length})
                                    </h3>
                                    {students.length === 0 && (
                                        <p className="text-sm font-bold text-gray-500 italic uppercase">
                                            Select a drive above to load applied students.
                                        </p>
                                    )}
                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-brutal">
                                        {students.map((s) => (
                                            <div
                                                key={s.id}
                                                draggable
                                                onDragStart={() => handleDragStart(s)}
                                                className="cursor-grab active:cursor-grabbing bg-[#FFCC00] border-[2px] border-black p-3 text-sm font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all select-none"
                                            >
                                                <span className="block truncate uppercase tracking-wider">{s.full_name}</span>
                                                <span className="text-xs font-bold tracking-widest bg-white px-2 mt-1 inline-block border-2 border-black">{s.branch} • {s.cgpa}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Calendar grid ────────────────────────────────────── */}
                            <div className="col-span-9">
                                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-0 overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500">
                                                <th className="py-3 px-3 text-left w-20 font-medium">Time</th>
                                                {weekDays.map((d) => {
                                                    const isToday = toDateStr(d) === toDateStr(new Date());
                                                    const isDriveDay = selectedDrive?.drive_date && toDateStr(d) === toDateStr(new Date(selectedDrive.drive_date));
                                                    return (
                                                        <th
                                                            key={toDateStr(d)}
                                                            className={`py-3 px-2 text-center font-medium ${isDriveDay ? "text-primary-700 bg-primary-50" : isToday ? "text-green-700 bg-green-50" : ""}`}
                                                        >
                                                            <span className="block">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                                                            <span className="block text-[10px] font-normal">
                                                                {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                                            </span>
                                                            {isDriveDay && <span className="block text-[9px] text-primary-500 font-normal">Drive Day</span>}
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {HOURS.map((hour) => (
                                                <tr key={hour} className="divide-x divide-gray-100">
                                                    <td className="py-2 px-3 text-gray-400 font-medium bg-gray-50 whitespace-nowrap">
                                                        {timeLabel(hour)}
                                                    </td>
                                                    {weekDays.map((d) => {
                                                        const dateStr = toDateStr(d);
                                                        const occupied = isOccupied(dateStr, hour);
                                                        const event = occupiedSlots.get(`${dateStr}-${hour}`);
                                                        const isDriveDay = selectedDrive?.drive_date && dateStr === toDateStr(new Date(selectedDrive.drive_date));
                                                        return (
                                                            <td
                                                                key={`${dateStr}-${hour}`}
                                                                onDragOver={(e) => {
                                                                    e.preventDefault();
                                                                    e.currentTarget.classList.add(
                                                                        occupied ? "bg-red-50" : "bg-green-50"
                                                                    );
                                                                }}
                                                                onDragLeave={(e) => {
                                                                    e.currentTarget.classList.remove("bg-red-50", "bg-green-50");
                                                                }}
                                                                onDrop={(e) => {
                                                                    e.preventDefault();
                                                                    e.currentTarget.classList.remove("bg-red-50", "bg-green-50");
                                                                    handleDrop(dateStr, hour);
                                                                }}
                                                                className={`py-2 px-2 h-14 text-center align-middle transition-colors ${occupied
                                                                    ? "bg-primary-50"
                                                                    : isDriveDay
                                                                        ? "bg-primary-50/30 hover:bg-primary-50 cursor-pointer"
                                                                        : "hover:bg-gray-50 cursor-pointer"
                                                                    }`}
                                                            >
                                                                {event && (
                                                                    <div className="relative group">
                                                                        <span className="text-primary-800 font-medium truncate block text-xs">
                                                                            {event.student.full_name}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => removeEvent(event.id)}
                                                                            className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-[10px] leading-none"
                                                                            title="Remove"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Summary */}
                {events.length > 0 && (
                    <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 mt-8">
                        <h3 className="text-2xl font-black uppercase tracking-wider text-black mb-4 border-b-[3px] border-black pb-2">
                            Scheduled Interviews ({events.length})
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {events.map((e) => {
                                const dayLabel = (() => {
                                    try { return new Date(e.day).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }); }
                                    catch { return e.day; }
                                })();
                                return (
                                    <span
                                        key={e.id}
                                        className="inline-flex items-center gap-2 bg-white border-[3px] border-black text-black text-xs font-black uppercase tracking-wider px-4 py-2 shadow-[4px_4px_0px_0px_#000]"
                                    >
                                        {e.student.full_name} <span className="text-[#E53955] px-1">•</span> {dayLabel} {timeLabel(e.hour)}
                                        <button
                                            onClick={() => removeEvent(e.id)}
                                            className="hover:text-white hover:bg-[#E53955] border-2 border-transparent hover:border-black px-1 ml-1 transition-colors"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
