import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Check, Brain, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FlashcardGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    noteTitle: string;
    noteContent: string;
}

export function FlashcardGenerator({ isOpen, onClose, noteTitle, noteContent }: FlashcardGeneratorProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<'idle' | 'analyzing' | 'generating' | 'review' | 'complete'>('idle');
    const [progress, setProgress] = useState(0);
    const [generatedCards, setGeneratedCards] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && step === 'idle') {
            startGeneration();
        }
    }, [isOpen]);

    const startGeneration = () => {
        setStep('analyzing');
        setProgress(0);

        // Simulate Analysis
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStep('generating');
                    generateCards();
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    const generateCards = () => {
        setTimeout(() => {
            // Simulated AI extraction based on note content (mocked for now)
            const mockCards = [
                { id: 1, front: `What is the core concept of ${noteTitle}?`, back: "A summary of the main arguments presented in the text." },
                { id: 2, front: "Key Definitions", back: "List of important terms found in the document." },
                { id: 3, front: "Critical Analysis", back: "Examination of the author's key points and evidence." },
                { id: 4, front: "Implications", back: "Potential real-world applications of these concepts." },
                { id: 5, front: "Counter-arguments", back: "Possible opposing viewpoints referenced in the text." }
            ];
            setGeneratedCards(mockCards);
            setStep('review');
        }, 1500);
    };

    const handleConfirm = () => {
        // Save to local storage for the Recall page to pick up
        const newDeck = {
            id: Date.now(),
            title: noteTitle,
            cards: generatedCards,
            createdAt: Date.now()
        };

        const existingDecksFn = localStorage.getItem("noteverse_flashcard_decks");
        const existingDecks = existingDecksFn ? JSON.parse(existingDecksFn) : [];
        localStorage.setItem("noteverse_flashcard_decks", JSON.stringify([newDeck, ...existingDecks]));

        toast.success("Deck Created Successfully!");
        setStep('complete');

        setTimeout(() => {
            onClose();
            navigate("/recall", { state: { deckId: newDeck.id } });
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md border-primary/20 bg-zinc-950/90 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI Flashcard Forge
                    </DialogTitle>
                    <DialogDescription>
                        Transforming your notes into active recall cards...
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {step === 'analyzing' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Analyzing semantic structure...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="grid grid-cols-4 gap-2 mt-4 opacity-50">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-20 bg-muted/20 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="relative">
                                <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
                                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-ping" />
                            </div>
                            <p className="text-sm text-purple-300 font-medium animate-pulse">Synthesizing Concepts...</p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-muted/10 rounded-xl p-4 border border-white/5">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-400" />
                                    Generated {generatedCards.length} Cards
                                </h3>
                                <ul className="space-y-2">
                                    {generatedCards.slice(0, 3).map((card, i) => (
                                        <li key={i} className="text-sm text-muted-foreground bg-black/20 p-2 rounded flex gap-2">
                                            <span className="text-purple-400 font-bold">Q:</span>
                                            <span className="truncate">{card.front}</span>
                                        </li>
                                    ))}
                                    <li className="text-xs text-center text-muted-foreground pt-1 italic">+ {generatedCards.length - 3} more</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 'complete' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-green-400">
                            <Check className="w-16 h-16 border-4 border-green-500 rounded-full p-2" />
                            <p className="font-bold text-lg">Deck Ready!</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'review' && (
                        <Button onClick={handleConfirm} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 font-bold shadow-lg shadow-purple-500/20">
                            Start Review Session
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
