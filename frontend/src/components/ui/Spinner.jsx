const SIZE_MAP = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
};

export default function Spinner({ size = "md", className = "" }) {
    return (
        <span
            className={`
        inline-block rounded-full border-current border-t-transparent animate-spin
        ${SIZE_MAP[size] || SIZE_MAP.md}
        ${className}
      `}
            role="status"
            aria-label="Loading"
        />
    );
}
