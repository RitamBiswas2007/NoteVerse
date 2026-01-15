import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, RefreshCw, Brain, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

// Mock Data for a demo deck
const DEMO_DECK = {
    title: "Calculus I: Derivatives",
    cards: [
        { id: 1, front: "What is the derivative of sin(x)?", back: "cos(x)" },
        { id: 2, front: "What is the Product Rule?", back: "d/dx(uv) = u'v + uv'" },
        { id: 3, front: "What is the derivative of e^x?", back: "e^x" },
        { id: 4, front: "Define the Chain Rule.", back: "d/dx f(g(x)) = f'(g(x)) * g'(x)" },
        { id: 5, front: "Derivative of ln(x)?", back: "1/x" },
    ]
};

export default function Recall() {
    const location = useLocation();
    const [deck, setDeck] = useState(DEMO_DECK);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        // Check if a specific deck was passed via navigation state
        if (location.state && location.state.deckId) {
            const storedDecksFn = localStorage.getItem("noteverse_flashcard_decks");
            if (storedDecksFn) {
                const storedDecks = JSON.parse(storedDecksFn);
                const foundDeck = storedDecks.find((d: any) => d.id === location.state.deckId);
                if (foundDeck) {
                    setDeck(foundDeck);
                }
            }
        }
    }, [location]);

    const currentCard = deck.cards[currentCardIndex];
    const progress = ((currentCardIndex) / deck.cards.length) * 100;

    const handleNext = (isCorrect: boolean | null) => {
        if (isCorrect !== null) {
            setScore(prev => ({
                correct: isCorrect ? prev.correct + 1 : prev.correct,
                wrong: !isCorrect ? prev.wrong + 1 : prev.wrong
            }));
        }

        if (currentCardIndex < deck.cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentCardIndex(prev => prev + 1), 300);
        } else {
            setSessionComplete(true);
        }
    };

    const resetSession = () => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setScore({ correct: 0, wrong: 0 });
        setSessionComplete(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-12 relative overflow-hidden">
                {/* Background Ambient Effects */}
                <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

                <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
                    <BackButton className="self-start mb-6 md:absolute md:-left-24 md:top-0 md:mb-0" />

                    <div className="w-full flex items-center justify-between mb-8 px-4">
                        <div>
                            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                                <Brain className="w-6 h-6 text-primary" />
                                Recall Mode
                            </h1>
                            <p className="text-muted-foreground text-sm">{deck.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">{currentCardIndex + 1} / {deck.cards.length}</p>
                                <p className="text-xs text-muted-foreground">Progress</p>
                            </div>
                            <Progress value={progress} className="w-24 h-2" />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!sessionComplete ? (
                            <div className="w-full max-w-2xl perspective-1000">
                                {/* The Card */}
                                <motion.div
                                    key={currentCard.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="relative w-full aspect-[16/10] min-h-[400px] cursor-pointer group"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    <motion.div
                                        className="w-full h-full absolute inset-0 rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center p-12 text-center backface-hidden"
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <span className="absolute top-8 left-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">Question</span>
                                        <h2 className="text-3xl md:text-5xl font-medium leading-tight text-foreground/90">
                                            {currentCard.front}
                                        </h2>
                                        <p className="absolute bottom-8 text-sm text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                            <RefreshCw className="w-3 h-3" /> Click to flip
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        className="w-full h-full absolute inset-0 rounded-3xl border border-accent/20 bg-accent/5 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center p-12 text-center backface-hidden"
                                        initial={{ rotateY: 180 }}
                                        animate={{ rotateY: isFlipped ? 0 : -180 }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <span className="absolute top-8 left-8 text-sm font-bold text-accent uppercase tracking-widest">Answer</span>
                                        <h2 className="text-3xl md:text-4xl font-medium leading-tight text-accent-foreground">
                                            {currentCard.back}
                                        </h2>
                                    </motion.div>
                                </motion.div>

                                {/* Controls */}
                                <div className="mt-10 flex items-center justify-center gap-6">
                                    {!isFlipped ? (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="px-8 rounded-full h-14 border-primary/20 hover:border-primary/50 text-lg group"
                                            onClick={() => setIsFlipped(true)}
                                        >
                                            <Lightbulb className="w-5 h-5 mr-2 group-hover:text-yellow-400 transition-colors" />
                                            Show Answer
                                        </Button>
                                    ) : (
                                        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="h-14 px-8 rounded-full border-red-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                                                onClick={(e) => { e.stopPropagation(); handleNext(false); }}
                                            >
                                                <XCircle className="w-5 h-5 mr-2" />
                                                Hard
                                            </Button>
                                            <Button
                                                size="lg"
                                                className="h-14 px-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 shadow-lg shadow-emerald-500/20"
                                                onClick={(e) => { e.stopPropagation(); handleNext(true); }}
                                            >
                                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                                Got it
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Card className="w-full max-w-md p-8 text-center glass-card animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
                                <p className="text-muted-foreground mb-8">You reviewed {deck.cards.length} cards.</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <div className="text-2xl font-bold text-green-500">{score.correct}</div>
                                        <div className="text-xs uppercase text-muted-foreground">Mastered</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="text-2xl font-bold text-red-500">{score.wrong}</div>
                                        <div className="text-xs uppercase text-muted-foreground">Review</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button onClick={resetSession} className="w-full" size="lg">Review Again</Button>
                                    <Button variant="outline" className="w-full" onClick={() => window.history.back()}>Back to Dashboard</Button>
                                </div>
                            </Card>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// Icon helper
function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
