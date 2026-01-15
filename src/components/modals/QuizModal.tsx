import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Trophy, Timer, Loader2 } from "lucide-react";

interface Question {
    id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (score: number) => void;
}

export function QuizModal({ isOpen, onClose, onComplete }: QuizModalProps) {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false); // Per question submission state
    const [showResult, setShowResult] = useState(false); // Final result screen
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Load questions on open
    useEffect(() => {
        if (isOpen) {
            loadQuestions();
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        setCurrentQIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsSubmitted(false);
        setShowResult(false);
    };

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            // Try to fetch quiz questions for today
            const { data: quizData, error: quizError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_date', today)
                .limit(10);
            if (quizError) throw quizError;
            if (quizData && quizData.length > 0) {
                setQuestions(quizData as any);
            } else {
                // No pre‑generated quiz for today – derive from user's notes
                const { data: notesData, error: notesError } = await supabase
                    .from('notes')
                    .select('id, title, content')
                    .eq('user_id', user?.id ?? '')
                    .limit(10);
                if (notesError) throw notesError;
                const derived: Question[] = (notesData || []).map((n: any) => ({
                    id: n.id,
                    question_text: n.title || 'Untitled Note',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct_option_index: 0,
                }));
                setQuestions(derived);
            }
        } catch (err) {
            console.error('Failed to load quiz', err);
            toast.error('Could not load quiz questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedOption(index);
    };

    const handleNextQuestion = () => {
        // Calculate score for current question
        const currentQ = questions[currentQIndex];
        const isCorrect = selectedOption === currentQ.correct_option_index;

        if (isCorrect) setScore(s => s + 1);

        // Move to next
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        } else {
            finishQuiz(isCorrect ? score + 1 : score);
        }
    };

    const finishQuiz = async (finalScore: number) => {
        setSubmitting(true);
        try {
            if (user) {
                await supabase.from('quiz_attempts').insert({
                    user_id: user.id,
                    score: finalScore,
                    max_score: questions.length,
                    quiz_date: new Date().toISOString().split('T')[0]
                });
            }
            setScore(finalScore);
            setShowResult(true);
            onComplete(finalScore);
            toast.success(`Quiz Completed! Score: ${finalScore}/${questions.length}`);
        } catch (error) {
            console.error("Error saving score:", error);
            // Show result anyway
            setShowResult(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl">
                {!showResult ? (
                    <>
                        <DialogHeader>
                            <div className="flex justify-between items-center mb-2">
                                <DialogTitle className="text-xl font-display">Daily Quiz</DialogTitle>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {currentQIndex + 1} / {questions.length}
                                </span>
                            </div>
                            <Progress value={((currentQIndex + 1) / questions.length) * 100} className="h-2" />
                        </DialogHeader>

                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : questions.length > 0 ? (
                            <div className="py-4 space-y-6">
                                <h2 className="text-lg font-semibold leading-relaxed">
                                    {questions[currentQIndex].question_text}
                                </h2>

                                <div className="grid gap-3">
                                    {questions[currentQIndex].options.map((option, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`
                                                p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between
                                                ${selectedOption === idx
                                                    ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20'
                                                    : 'bg-card hover:bg-muted/50 border-border hover:border-primary/30'}
                                            `}
                                        >
                                            <span className={`font-medium ${selectedOption === idx ? 'text-primary' : 'text-foreground'}`}>
                                                {option}
                                            </span>
                                            {selectedOption === idx && (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">No questions available today.</div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleNextQuestion}
                                disabled={selectedOption === null || submitting}
                                className="w-32"
                            >
                                {currentQIndex === questions.length - 1 ? (submitting ? "Submitting..." : "Finish") : "Next"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="text-center py-8 animate-in zoom-in-50 duration-300">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-12 h-12 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold font-display mb-2">Quiz Completed!</h2>
                        <p className="text-muted-foreground mb-6">You've completed today's challenge.</p>

                        <div className="bg-muted/30 rounded-2xl p-6 max-w-xs mx-auto mb-8 border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Your Score</div>
                            <div className="text-5xl font-bold text-primary mb-2">{score} <span className="text-2xl text-muted-foreground">/ {questions.length}</span></div>
                            <div className="text-xs font-medium bg-primary/10 text-primary inline-block px-3 py-1 rounded-full">
                                {score >= 7 ? "Excellent!" : score >= 5 ? "Good Job!" : "Keep Learning!"}
                            </div>
                        </div>

                        <Button onClick={onClose} size="lg" className="w-full sm:w-auto min-w-[200px]">
                            Close Results
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
