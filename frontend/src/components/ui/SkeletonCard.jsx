export default function SkeletonCard({ height = "h-36", className = "" }) {
  return (
    <div className={`skeleton rounded-xl ${height} ${className}`} aria-hidden="true" />
  );
}

export function SkeletonText({ width = "w-full", className = "" }) {
  return (
    <div className={`skeleton h-4 rounded ${width} ${className}`} aria-hidden="true" />
  );
}

export function SkeletonList({ count = 3, height = "h-36" }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  );
}
