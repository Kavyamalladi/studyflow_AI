import { cn } from '@/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-secondary', className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-4/5' : 'w-full')} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="mx-auto h-5 w-full max-w-xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="mx-auto h-11 w-40" />
    </div>
  );
}

export function FeatureCardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6" aria-hidden="true">
      <Skeleton className="mb-4 size-10 rounded-lg" />
      <Skeleton className="mb-2 h-5 w-2/3" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function LandingPageSkeleton() {
  return (
    <div className="space-y-16 py-12">
      <HeroSkeleton />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <FeatureCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
