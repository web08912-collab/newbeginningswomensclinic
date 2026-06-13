export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-muted/60 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass space-y-3 rounded-2xl p-5">
      <Shimmer className="h-4 w-1/3" />
      <Shimmer className="h-8 w-2/3" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-1/3" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      <Shimmer className="h-7 w-20 rounded-full" />
    </div>
  );
}
