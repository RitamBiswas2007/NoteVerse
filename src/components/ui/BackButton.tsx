import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";

interface BackButtonProps {
  className?: string;
  label?: string;
  fallback?: string;
}

export function BackButton({ className, label = "Back", fallback = "/" }: BackButtonProps) {
  const { goBack } = useSmartNavigation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => goBack(fallback)}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 group",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      {label}
    </Button>
  );
}
