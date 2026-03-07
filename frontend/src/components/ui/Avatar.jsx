export default function Avatar({ name = "", size = "md", className = "" }) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() || "")
        .join("");

    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
    };

    return (
        <div
            className={`bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase tracking-wider flex items-center justify-center flex-shrink-0 select-none ${sizes[size]} ${className}`}
            title={name}
        >
            {initials || "?"}
        </div>
    );
}
