export default function EmptyState({
    emoji = "📭",
    title = "Nothing here yet",
    subtitle = "",
    action = null,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <span className="text-5xl mb-4" aria-hidden="true">{emoji}</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 max-w-xs mb-6">{subtitle}</p>}
            {action}
        </div>
    );
}
