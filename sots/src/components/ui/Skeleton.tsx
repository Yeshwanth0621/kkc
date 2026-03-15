export function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || '100%', height: height || '20px' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card/60 border border-[rgba(0,240,255,0.06)] rounded-2xl p-5 space-y-3">
      <Skeleton height="14px" width="60%" />
      <Skeleton height="28px" width="40%" />
      <Skeleton height="12px" width="80%" />
    </div>
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="bg-card/60 border border-[rgba(0,240,255,0.06)] rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton width="32px" height="32px" className="rounded-lg" />
        <Skeleton height="14px" width="60%" />
      </div>
      <Skeleton height="28px" width="40%" />
      <Skeleton height="10px" width="50%" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <Skeleton height="14px" width={`${60 + Math.random() * 30}%`} />
        </td>
      ))}
    </tr>
  );
}
