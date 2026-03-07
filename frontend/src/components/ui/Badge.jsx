const STATUS_STYLES = {
    Applied: "bg-blue-400 text-black",
    Shortlisted: "bg-[#FFCC00] text-black",
    Selected: "bg-green-400 text-black",
    Rejected: "bg-[#E53955] text-white",
    Active: "bg-green-400 text-black",
    Closed: "bg-black text-white",
    Upcoming: "bg-white text-black",
};

export default function Badge({ label, variant, className = "" }) {
    const style = STATUS_STYLES[variant] || STATUS_STYLES[label] || "bg-white text-black";
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 border-2 border-black rounded-md text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${style} ${className}`}
        >
            {label}
        </span>
    );
}
