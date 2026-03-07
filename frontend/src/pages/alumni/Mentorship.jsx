import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";

const SESSION_TYPES = ["Mock Interview", "Resume Review", "Career Guidance", "Technical Discussion"];

function formatSlotTime(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

// ── Notification Bell (Alumni only) ──────────────────────────────────────────
function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { data, refetch } = useQuery({
        queryKey: ["alumni-notifications"],
        queryFn: () => api.get("/api/alumni/notifications").then((r) => r.data),
        refetchInterval: 15000, // poll every 15s
    });

    const markRead = useMutation({
        mutationFn: () => api.patch("/api/alumni/notifications/read"),
        onSuccess: () => refetch(),
    });

    const notifs = data?.notifications || [];
    const unread = data?.unread_count || 0;

    return (
        <div className="relative">
            <button
                onClick={() => { setOpen((p) => !p); if (unread > 0) markRead.mutate(); }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] z-50 max-h-80 overflow-y-auto scrollbar-brutal">
                    <div className="px-4 py-3 border-b-[3px] border-black bg-[#E53955] text-white">
                        <h4 className="text-sm font-black uppercase tracking-wider">Notifications</h4>
                    </div>
                    {notifs.length === 0 && (
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center py-6">No notifications yet</p>
                    )}
                    {notifs.map((n) => (
                        <div key={n._id} className={`px-4 py-3 border-b-[2px] border-black ${!n.read ? "bg-[#FFCC00] text-black" : "bg-white text-gray-800"}`}>
                            <p className="text-sm font-black uppercase tracking-wider">{n.title}</p>
                            <p className="text-xs font-bold mt-1 text-black">{n.message}</p>
                            <p className="text-[10px] font-black tracking-widest uppercase mt-2 opacity-70">
                                {new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Mentorship() {
    const { role } = useAuth();
    const queryClient = useQueryClient();
    const isAlumni = role === "alumni";
    const [showModal, setShowModal] = useState(false);
    const [confirmSlot, setConfirmSlot] = useState(null);

    // Form state for new slot
    const [slotDate, setSlotDate] = useState("");
    const [slotStart, setSlotStart] = useState("10:00");
    const [slotEnd, setSlotEnd] = useState("11:00");
    const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
    const [maxStudents, setMaxStudents] = useState(5);
    const [meetLink, setMeetLink] = useState("");

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["mentorship-slots"],
        queryFn: () => api.get("/api/alumni/slots").then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (payload) => api.post("/api/alumni/slots", payload),
        onSuccess: () => {
            toast.success("Slot created! ✅");
            queryClient.invalidateQueries({ queryKey: ["mentorship-slots"] });
            setShowModal(false);
            setMeetLink("");
            setMaxStudents(5);
        },
        onError: (err) => toast.error(err.response?.data?.detail || "Failed to create slot."),
    });

    const bookMutation = useMutation({
        mutationFn: (slotId) => api.post(`/api/alumni/slots/${slotId}/book`),
        onSuccess: () => {
            toast.success("Slot booked! 🎉");
            queryClient.invalidateQueries({ queryKey: ["mentorship-slots"] });
            setConfirmSlot(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || "Failed to book slot.");
            setConfirmSlot(null);
        },
    });

    const handleCreateSlot = () => {
        if (!slotDate) { toast.error("Select a date."); return; }
        createMutation.mutate({
            start_time: new Date(`${slotDate}T${slotStart}`).toISOString(),
            end_time: new Date(`${slotDate}T${slotEnd}`).toISOString(),
            session_type: sessionType,
            max_students: maxStudents,
            meet_link: meetLink.trim(),
        });
    };

    const slots = data?.slots || [];

    return (
        <AppLayout pageTitle="Mentorship">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">Mentorship</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {isAlumni ? "Create slots for mock interviews & guidance sessions" : "Book a session with an alumni mentor"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAlumni && <NotificationBell />}
                        {isAlumni && (
                            <Button onClick={() => setShowModal(true)}>
                                + Create Slot
                            </Button>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {isLoading && <SkeletonList count={3} height="h-28" />}

                {/* Error */}
                {isError && (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 mb-4">Failed to load slots.</p>
                        <button onClick={refetch} className="text-sm text-primary-600 hover:underline">Try Again</button>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && slots.length === 0 && (
                    <EmptyState
                        emoji="🗓"
                        title={isAlumni ? "No slots created yet" : "No available slots"}
                        subtitle={isAlumni ? "Create your first mentorship slot!" : "Check back later — alumni will post available time slots."}
                    />
                )}

                {/* Slot cards */}
                {slots.length > 0 && (
                    <div className="space-y-6">
                        {slots.map((slot) => {
                            const isFull = slot.is_full;
                            const alreadyBooked = slot.already_booked;
                            const spotsLeft = slot.spots_left ?? 0;
                            const bookedCount = slot.booked_count ?? 0;
                            const maxCap = slot.max_students ?? 1;

                            return (
                                <div key={slot._id} className={`bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 focus-within:shadow-[4px_4px_0px_0px_#000] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all relative ${isFull && !isAlumni ? "opacity-60" : ""}`}>
                                    {isFull && !isAlumni && (
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10"></div>
                                    )}
                                    <div className="flex items-start justify-between gap-3 border-b-[3px] border-black pb-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-lg font-black uppercase tracking-wider text-black bg-[#FFCC00] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                                                    {formatSlotTime(slot.start_time)}
                                                </span>
                                                <span className="text-black font-black text-xl">→</span>
                                                <span className="text-lg font-black uppercase tracking-wider text-black bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                                                    {formatSlotTime(slot.end_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap mt-3">
                                                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 border-[2px] border-black bg-purple-200 text-black shadow-[2px_2px_0px_0px_#000]">
                                                    {slot.session_type}
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">by <span className="text-black">{slot.alumni_name}</span></span>
                                            </div>

                                            {/* Capacity bar */}
                                            <div className="mt-4">
                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                    <span>👥 <span className="text-black">{bookedCount}/{maxCap}</span> spots filled</span>
                                                    {isFull ? (
                                                        <span className="text-white bg-[#E53955] border-2 border-black px-2 py-0.5">Full</span>
                                                    ) : (
                                                        <span className="text-green-700 bg-green-100 border-2 border-green-700 px-2 py-0.5">{spotsLeft} left</span>
                                                    )}
                                                </div>
                                                <div className="w-full h-3 bg-gray-100 border-2 border-black relative overflow-hidden">
                                                    <div
                                                        className={`h-full border-r-2 border-black transition-all ${isFull ? "bg-[#E53955]" : "bg-green-400"}`}
                                                        style={{ width: `${Math.min(100, (bookedCount / maxCap) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Meet link (shown to booked students & alumni) */}
                                            {slot.meet_link && (
                                                <a
                                                    href={slot.meet_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 mt-4 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                                                >
                                                    📹 Join Google Meet
                                                </a>
                                            )}

                                            {/* Booked students list (Alumni view) */}
                                            {isAlumni && slot.booked_students?.length > 0 && (
                                                <div className="mt-4 pt-4 border-t-[3px] border-black border-dashed">
                                                    <p className="text-xs font-black uppercase tracking-wider text-black mb-2">Booked Students</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {slot.booked_students.map((b, i) => (
                                                            <span key={i} className="text-xs font-bold uppercase tracking-widest bg-green-100 border-2 border-green-700 text-green-800 px-3 py-1">
                                                                {b.student_name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-col items-end gap-2 relative z-20">
                                            {isFull && (
                                                <Badge label="Full" variant="Rejected" />
                                            )}
                                            {alreadyBooked && !isAlumni && (
                                                <Badge label="Booked ✓" variant="Active" />
                                            )}
                                            {!isAlumni && !alreadyBooked && !isFull && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setConfirmSlot(slot)}
                                                >
                                                    Book Slot
                                                </Button>
                                            )}
                                            {!isFull && isAlumni && (
                                                <span className="text-xs font-black uppercase tracking-wider text-green-700 border-2 border-green-700 px-3 py-1 bg-green-50">Open</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Slot Modal (Alumni) */}
            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <div className="p-4 border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_#000]">
                    <div className="text-center mb-6">
                        <span className="text-6xl mb-4 block">🗓</span>
                        <h2 className="text-2xl font-black uppercase tracking-wider text-black border-b-[3px] border-black pb-4">Create Mentorship Slot</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">Date</label>
                            <input
                                type="date"
                                value={slotDate}
                                onChange={(e) => setSlotDate(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">Start Time</label>
                                <input
                                    type="time"
                                    value={slotStart}
                                    onChange={(e) => setSlotStart(e.target.value)}
                                    className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">End Time</label>
                                <input
                                    type="time"
                                    value={slotEnd}
                                    onChange={(e) => setSlotEnd(e.target.value)}
                                    className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">Session Type</label>
                            <select
                                value={sessionType}
                                onChange={(e) => setSessionType(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black bg-white focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all"
                            >
                                {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">Max Students</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all"
                            />
                            <p className="text-xs font-bold uppercase tracking-widest text-[#FFCC00] bg-black px-2 py-1 mt-2 inline-block">Number of students who can join this session</p>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">Google Meet Link</label>
                            <input
                                type="url"
                                value={meetLink}
                                onChange={(e) => setMeetLink(e.target.value)}
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                className="w-full px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all placeholder-gray-400"
                            />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Students will see this link after booking</p>
                        </div>
                        <div className="flex gap-4 pt-4 mt-6 border-t-[3px] border-black">
                            <Button variant="secondary" className="flex-1 py-3" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button className="flex-1 py-3" onClick={handleCreateSlot} loading={createMutation.isPending}>Create Slot</Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Booking Confirmation Modal (Student) */}
            <Modal open={!!confirmSlot} onClose={() => setConfirmSlot(null)}>
                {confirmSlot && (
                    <div className="p-4 border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_#000]">
                        <div className="text-center space-y-6">
                            <span className="text-6xl block">🗓</span>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider text-black border-b-[3px] border-black pb-4 mb-4">Confirm Booking</h2>
                                <p className="text-sm font-bold text-gray-600 bg-gray-100 p-4 border-[3px] border-black">
                                    Book a <strong className="text-black text-lg block my-2 uppercase">{confirmSlot.session_type}</strong> with{" "}
                                    <strong className="text-black">{confirmSlot.alumni_name}</strong>?
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-4 bg-[#FFCC00] border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000]">
                                <span className="text-sm font-black text-black">
                                    {formatSlotTime(confirmSlot.start_time)}
                                </span>
                                <span className="font-black">→</span>
                                <span className="text-sm font-black text-black">
                                    {formatSlotTime(confirmSlot.end_time)}
                                </span>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-[#E53955] border-2 border-[#E53955] bg-red-50 p-2 inline-block">
                                {confirmSlot.spots_left} spot{confirmSlot.spots_left !== 1 ? "s" : ""} remaining
                            </p>
                            <div className="flex gap-4 pt-6 pb-2 border-t-[3px] border-black">
                                <Button variant="secondary" className="flex-1 py-3" onClick={() => setConfirmSlot(null)}>Cancel</Button>
                                <Button
                                    className="flex-1 py-3"
                                    loading={bookMutation.isPending}
                                    onClick={() => bookMutation.mutate(confirmSlot._id)}
                                >
                                    Confirm Booking
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
