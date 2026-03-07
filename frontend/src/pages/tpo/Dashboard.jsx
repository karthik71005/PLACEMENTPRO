import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import api from "../../services/api";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

function StatCard({ label, value, icon, color = "bg-primary-50 text-primary-700" }) {
    return (
        <div className="bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
            <div className={`w-14 h-14 rounded-lg border-2 border-black flex items-center justify-center text-2xl flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-black text-black tracking-tighter leading-none">{value ?? "—"}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function TPODashboard() {
    const { data: drivesData } = useQuery({
        queryKey: ["tpo-drives"],
        queryFn: () => api.get("/api/drives").then((r) => r.data),
    });

    const drives = drivesData?.drives || [];
    const activeDrives = drives.filter((d) => d.status === "Active").length;
    const totalDrives = drives.length;
    const recentDrives = [...drives].slice(0, 5);

    return (
        <AppLayout pageTitle="Dashboard">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tight mb-2">TPO Dashboard</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Overview of placement activities</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Drives" value={totalDrives} icon="🏢" color="bg-[#FFCC00] text-black" />
                    <StatCard label="Active Drives" value={activeDrives} icon="✅" color="bg-green-400 text-black" />
                    <StatCard label="Placements" value="—" icon="🎓" color="bg-white text-black" />
                    <StatCard label="Open Slots" value="—" icon="📅" color="bg-[#E53955] text-white" />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4 flex-wrap">
                    <Link
                        to="/tpo/drives"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFCC00] rounded-lg border-2 border-black text-black text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        🏢 Create Drive
                    </Link>
                    <Link
                        to="/tpo/notifications"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg border-2 border-black text-black text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        🔔 Send Notification
                    </Link>
                </div>

                {/* Recent Drives */}
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-wider text-black mb-4">Recent Drives</h2>
                    {recentDrives.length === 0 ? (
                        <p className="text-sm font-bold text-gray-500 italic uppercase">No drives created yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentDrives.map((d) => (
                                <div key={d._id} className="flex items-center justify-between bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] px-6 py-5 hover:-translate-y-1 transition-transform">
                                    <div>
                                        <span className="text-lg font-black uppercase tracking-wider text-black">{d.company_name}</span>
                                        <span className="mx-3 text-gray-300 font-black">·</span>
                                        <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">{d.role}</span>
                                    </div>
                                    <Badge label={d.status} variant={d.status} />
                                </div>
                            ))}
                        </div>
                    )}
                    {totalDrives > 5 && (
                        <Link to="/tpo/drives" className="inline-block mt-6 text-sm font-black uppercase tracking-wider text-black border-b-[3px] border-black hover:bg-[#FFCC00] transition-colors pb-1">
                            View all {totalDrives} drives →
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
