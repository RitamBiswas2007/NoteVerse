import { useState } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quotes = [
    {
        text: "Alone we can do so little; together we can do so much.",
        author: "Helen Keller"
    },
    {
        text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
        author: "Malcolm X"
    },
    {
        text: "The beautiful thing about learning is that no one can take it away from you.",
        author: "B.B. King"
    },
    {
        text: "Share your knowledge. It is a way to achieve immortality.",
        author: "Dalai Lama"
    },
    {
        text: "If I have seen further, it is by standing on the shoulders of giants.",
        author: "Isaac Newton"
    },
    {
        text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        author: "Mahatma Gandhi"
    },
    {
        text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
        author: "Benjamin Franklin"
    }
];

export function QuoteOfTheDay() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNewQuote = () => {
        setIsAnimating(true);
        // Simple delay to allow fade-out animation
        setTimeout(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * quotes.length);
            } while (newIndex === currentIndex);

            setCurrentIndex(newIndex);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 pattern-dots opacity-50 pointer-events-none" />
            <div className="absolute left-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl rotate-3 flex items-center justify-center shadow-sm">
                        <Quote className="w-8 h-8 text-primary -rotate-3" />
                    </div>
                </div>

                <div
                    className={cn(
                        "space-y-8 transition-all duration-300 ease-out",
                        isAnimating ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"
                    )}
                >
                    <blockquote className="text-3xl sm:text-4xl md:text-5xl font-display font-medium italic text-foreground leading-tight">
                        "{quotes[currentIndex].text}"
                    </blockquote>

                    <div className="flex items-center justify-center gap-4 text-muted-foreground animate-fade-in animation-delay-200">
                        <div className="h-px w-12 bg-border"></div>
                        <span className="text-lg font-medium tracking-wide uppercase">{quotes[currentIndex].author}</span>
                        <div className="h-px w-12 bg-border"></div>
                    </div>
                </div>

                <div className="mt-12">
                    <Button
                        variant="ghost"
                        onClick={handleNewQuote}
                        className="group text-muted-foreground hover:text-primary transition-all duration-300 hover:bg-primary/5"
                        disabled={isAnimating}
                    >
                        <RefreshCw className={cn(
                            "w-4 h-4 mr-2 transition-transform duration-500",
                            isAnimating ? "rotate-180" : "group-hover:rotate-180"
                        )} />
                        Show me a new quote
                    </Button>
                </div>
            </div>
        </section>
    );
}
