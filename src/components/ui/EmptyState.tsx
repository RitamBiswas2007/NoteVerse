import { Button } from "@/components/ui/button";
import { LucideIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/5",
            className
        )}>
            {Icon && (
                <div className="w-14 h-14 bg-background rounded-full shadow-sm flex items-center justify-center mb-4 ring-1 ring-border">
                    <Icon className="w-7 h-7 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight mb-1">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
