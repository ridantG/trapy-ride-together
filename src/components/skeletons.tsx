import { Skeleton } from '@/components/ui/skeleton';

export function RideCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-0.5 h-8" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-16 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-0.5 h-8" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-16 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
