import { ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
    className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
    return (
        <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-700", className)}>
            <div className="relative mb-8">
                {/* Orbital Rings */}
                <div className="absolute inset-[-20px] border-2 border-primary/10 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-[-10px] border-2 border-accent/10 rounded-full animate-[spin_2s_linear_infinite_reverse]" />

                <div className="relative bg-card p-6 rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-display font-black tracking-tighter text-foreground">
                    Note<span className="gradient-text">Verse</span>
                </h2>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-12 bg-muted rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-primary animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 animate-pulse">
                        Synchronizing Knowledge
                    </p>
                </div>
            </div>
        </div>
    );
}
