import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    LayoutDashboard, Building2, Calendar, Bell,
    Briefcase, Globe, FileText, Pin, BrainCircuit,
    Users, LogOut
} from "lucide-react";
import logo from "../../utils/logo.png";

// ── Role-based nav config ─────────────────────────────────────────────────────
const NAV_LINKS = {
    tpo: [
        { to: "/tpo/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
        { to: "/tpo/drives", label: "DRIVES", icon: Building2 },
        { to: "/tpo/scheduler", label: "SCHEDULER", icon: Calendar },
        { to: "/tpo/notifications", label: "NOTIFY", icon: Bell },
        { to: "/alumni/jobs", label: "OPPORTUNITIES", icon: Briefcase },
    ],
    student: [
        { to: "/student/feed", label: "PULSE", icon: Globe },
        { to: "/student/resume", label: "RESUME", icon: FileText },
        { to: "/student/tracker", label: "DRIVE TRACKER", icon: Pin },
        { to: "/student/skill-gap", label: "AI SKILL ANALYZER", icon: BrainCircuit },
        { to: "/alumni/jobs", label: "OPPORTUNITIES", icon: Briefcase },
        { to: "/alumni/mentorship", label: "MENTORHUB", icon: Users },
    ],
    alumni: [
        { to: "/alumni/jobs", label: "OPPORTUNITIES", icon: Briefcase },
        { to: "/alumni/mentorship", label: "MENTORHUB", icon: Users },
    ],
};

export default function Sidebar({ collapsed = false }) {
    const { role, user, logout } = useAuth();
    const links = NAV_LINKS[role] || [];

    return (
        <aside
            className={`
        flex flex-col h-full bg-[#FFF6D9] border-r-[3px] border-black flex-shrink-0 transition-all duration-200
        ${collapsed ? "w-20" : "w-64"}
      `}
        >
            {/* Logo */}
            <div className="flex justify-center items-center gap-2 px-4 py-4 border-b-[3px] border-black bg-[#FFCC00] min-h-[4rem]">
                <img src={logo} alt="PlacementPro Logo" className="w-8 h-8 object-contain" />
                {!collapsed && (
                    <span className="font-black text-black tracking-wider uppercase text-lg whitespace-nowrap">PlacementPro</span>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-brutal bg-white">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-widest border-[3px] transition-all
              ${isActive
                                ? "bg-black text-[#FFCC00] border-black shadow-[4px_4px_0px_0px_#FFCC00]"
                                : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`flex items-center justify-center p-1.5 border-[2px] ${isActive ? 'bg-[#FFCC00] text-black border-black shadow-[2px_2px_0px_0px_#FFF]' : 'bg-gray-100 text-black border-black shadow-[2px_2px_0px_0px_#000]'}`}>
                                    <Icon size={18} strokeWidth={3} />
                                </span>
                                {!collapsed && <span className="truncate">{label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="border-t-[3px] border-black p-4 bg-[#FFCC00]">
                {!collapsed && (
                    <p className="text-xs font-black uppercase tracking-wider text-black truncate mb-3 px-1 border-b-2 border-black pb-2">
                        {user?.email}
                    </p>
                )}
                <button
                    onClick={logout}
                    className="flex justify-center items-center gap-3 w-full px-3 py-3 text-xs font-black uppercase tracking-widest bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                >
                    <span className="text-lg flex-shrink-0 text-white group-hover:text-[#FFCC00] transition-colors"><LogOut size={16} strokeWidth={3} /></span>
                    {!collapsed && <span>SIGN OUT</span>}
                </button>
            </div>
        </aside>
    );
}
