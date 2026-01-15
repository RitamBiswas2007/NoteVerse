import { LucideIcon, LayoutDashboard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title = "No items found",
    description = "There is nothing to show here yet.",
    icon: Icon = LayoutDashboard,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 text-center animate-in fade-in zoom-in duration-500", className)}>
            <div className="bg-zinc-900 p-4 rounded-full mb-4 shadow-xl border border-white/5">
                <Icon className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200">{title}</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-6 leading-relaxed">
                {description}
            </p>
            {action}
        </div>
    );
}

export function EmptySearchState() {
    return (
        <EmptyState
            title="No matches found"
            description="We couldn't find anything matching your search. Try different keywords."
            icon={Search}
        />
    )
}
