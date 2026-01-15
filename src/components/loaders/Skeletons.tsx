import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function NoteCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <div className="space-y-1 flex flex-col items-end">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <Skeleton className="h-64 w-full" />
            <div className="container mx-auto px-6 -mt-20">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[320px]">
                        <Card className="h-[400px] flex items-center justify-center">
                            <Skeleton className="w-32 h-32 rounded-full" />
                        </Card>
                    </div>
                    <div className="flex-1 space-y-4 pt-20 md:pt-0">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
