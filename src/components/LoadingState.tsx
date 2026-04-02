"use client";

export default function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
        >
          {/* Thumbnail skeleton */}
          <div className="aspect-video bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-shimmer" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-5 bg-zinc-800 rounded w-3/4 animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
              <div className="h-1.5 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="flex-1 h-9 bg-zinc-800 rounded-lg animate-pulse" />
              <div className="w-10 h-9 bg-zinc-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
