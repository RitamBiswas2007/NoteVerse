import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function NoteReaderGuide() {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Show guide if it's the first time visiting specific page or triggered via demo
        const hasSeenGuide = localStorage.getItem("noteverse_reader_guide_seen");
        if (!hasSeenGuide) {
            setTimeout(() => setIsVisible(true), 1500);
        }
    }, []);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);

            // Execute automated actions for demo
            if (actions[step + 1]) {
                actions[step + 1]();
            }
        } else {
            finishGuide();
        }
    };

    const finishGuide = () => {
        setIsVisible(false);
        localStorage.setItem("noteverse_reader_guide_seen", "true");
    };

    const actions: Record<number, () => void> = {
        2: () => {
            // Simulate hover on flashcard trigger
            const el = document.getElementById("flashcard-trigger");
            if (el) {
                el.classList.add("ring-2", "ring-offset-2", "ring-amber-500");
                setTimeout(() => el.classList.remove("ring-2", "ring-offset-2", "ring-amber-500"), 2000);
            }
        },
        3: () => {
            // Simulate click
            const el = document.getElementById("flashcard-trigger");
            if (el) el.click();
            finishGuide();
        }
    };

    const steps = [
        {
            title: "Welcome to Deep Reading",
            description: "This isn't just a PDF viewer. It's a cognitive workspace.",
            targetPositions: "top-[20%] left-[50%] -translate-x-1/2"
        },
        {
            title: "AI Co-Pilot",
            description: "Ask questions, get summaries, and explore topics simply by chatting.",
            targetPositions: "top-[15%] right-[350px]"
        },
        {
            title: "Flashcard Forge",
            description: "Turn this note into a study deck instantly using AI. Let's try it.",
            targetPositions: "top-[60px] right-[200px]"
        },
        {
            title: "Generating Deck...",
            description: "Watch as we extract key concepts for you.",
            targetPositions: "top-[50%] left-[50%] -translate-x-1/2"
        }
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in" />

            <div className={cn(
                "absolute bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-2xl w-80 pointer-events-auto transition-all duration-500 ease-in-out",
                steps[step].targetPositions
            )}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-white">{steps[step].title}</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={finishGuide}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    {steps[step].description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div key={i} className={cn("h-1.5 w-1.5 rounded-full transition-colors", i === step ? "bg-cyan-500" : "bg-zinc-800")} />
                        ))}
                    </div>
                    <Button onClick={handleNext} className="bg-white text-black hover:bg-zinc-200">
                        {step === steps.length - 1 ? "Start Magic" : "Next"}
                    </Button>
                </div>

                {/* Simulated Cursor for effect */}
                <MousePointer2 className="absolute -bottom-8 -right-8 w-12 h-12 text-white drop-shadow-lg animate-bounce opacity-20" />
            </div>
        </div>
    );
}
