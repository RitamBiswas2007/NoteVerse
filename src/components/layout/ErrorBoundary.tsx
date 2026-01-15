import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            const isNetworkError = this.state.error?.message.includes("Failed to fetch") ||
                this.state.error?.message.includes("Supabase") ||
                this.state.error?.message.includes("network");

            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isNetworkError ? 'bg-zinc-800 text-zinc-400' : 'bg-destructive/10 text-destructive'}`}>
                        {isNetworkError ? <WifiOff className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                    </div>

                    <h2 className="text-3xl font-display font-bold tracking-tight mb-3">
                        {isNetworkError ? "Connection Lost" : "Something went wrong"}
                    </h2>

                    <p className="text-muted-foreground max-w-[420px] mb-8 text-lg leading-relaxed">
                        {isNetworkError
                            ? "We couldn't reach the NoteVerse servers. Please check your internet connection."
                            : "We encountered an unexpected error. Our engineering team has been notified."}

                        {!isNetworkError && (
                            <span className="block mt-4 text-xs font-mono bg-muted px-3 py-2 rounded-lg max-w-full truncate opacity-70">
                                {this.state.error?.message}
                            </span>
                        )}
                    </p>

                    <div className="flex gap-4">
                        <Button variant="outline" size="lg" onClick={() => window.location.reload()} className="h-12 px-8">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reload Page
                        </Button>
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                            variant="default"
                            size="lg"
                            className="h-12 px-8 bg-gradient-primary"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
