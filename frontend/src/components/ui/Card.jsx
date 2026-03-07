export default function Card({ children, className = "", ...props }) {
    return (
        <div
            className={`bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] p-6 transition-all ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
