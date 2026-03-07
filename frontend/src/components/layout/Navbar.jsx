import { useAuth } from "../../hooks/useAuth";
import Avatar from "../ui/Avatar";

export default function Navbar({ title = "", onMenuToggle }) {
    const { user, role } = useAuth();
    const displayName = user?.displayName || user?.email || "";

    const ROLE_LABELS = {
        tpo: "Placement Officer",
        student: "Student",
        alumni: "Alumni",
    };

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-[#FFCC00] border-b-[3px] border-black flex-shrink-0">
            {/* Left: hamburger + title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-1 border-[2px] border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all md:hidden text-black"
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {title && <h1 className="font-black text-black text-xl uppercase tracking-widest">{title}</h1>}
            </div>

            {/* Right: role badge + avatar */}
            <div className="flex items-center gap-4">
                {role && (
                    <span className="hidden sm:block text-xs font-black uppercase tracking-widest bg-white border-[2px] border-black text-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                        {ROLE_LABELS[role] || role}
                    </span>
                )}
                <Avatar name={displayName} />
            </div>
        </header>
    );
}
