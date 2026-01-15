import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import {
    Code,
    Stethoscope,
    Briefcase,
    Palette,
    GraduationCap,
    Microscope,
    BookOpen,
    ArrowRight,
    Check
} from "lucide-react";

const MAJORS = [
    { id: "cs", label: "Computer Science", icon: Code, color: "text-blue-400", border: "border-blue-500/50" },
    { id: "med", label: "Medicine", icon: Stethoscope, color: "text-red-400", border: "border-red-500/50" },
    { id: "business", label: "Business", icon: Briefcase, color: "text-amber-400", border: "border-amber-500/50" },
    { id: "arts", label: "Arts & Design", icon: Palette, color: "text-purple-400", border: "border-purple-500/50" },
];

const ROLES = [
    { id: "student", label: "Undergrad Student", icon: GraduationCap },
    { id: "researcher", label: "Researcher", icon: Microscope },
    { id: "educator", label: "Educator / Mentor", icon: BookOpen },
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useLocalStorage("noteverse-user-prefs", { major: "", role: "" });
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage("noteverse-onboarding-complete", false);

    // Trigger on mount if not completed
    useEffect(() => {
        if (!hasCompletedOnboarding) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, [hasCompletedOnboarding]);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setHasCompletedOnboarding(true);
        setIsOpen(false);
    };

    const isStepValid = () => {
        if (step === 1) return !!preferences.major;
        if (step === 2) return !!preferences.role;
        return true;
    };

    const updatePreference = (key: string, value: string) => {
        setPreferences({ ...preferences, [key]: value });
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            {/* Prevent closing by clicking outside to force onboarding */}
            <DialogContent className="max-w-3xl border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white [&>button]:hidden">

                {/* Header with Progress */}
                <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Step {step} of 3</span>
                        <span>{step === 1 ? "Academic Focus" : step === 2 ? "Your Role" : "All Set"}</span>
                    </div>
                    <Progress value={(step / 3) * 100} className="h-2 bg-white/10" indicatorClassName="bg-gradient-primary" />
                </div>

                <div className="py-8 min-h-[300px] flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Step 1: Major */}
                    {step === 1 && (
                        <div className="w-full space-y-8">
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-2">What are you studying?</h2>
                                <p className="text-white/60">We will personalize your feed based on your choice.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {MAJORS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => updatePreference("major", option.id)}
                                        className={cn(
                                            "relative p-6 rounded-2xl border bg-white/5 hover:bg-white/10 transition-all duration-300 group text-left h-32 flex flex-col justify-between",
                                            preferences.major === option.id
                                                ? `ring-2 ring-primary border-transparent shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]`
                                                : "border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <option.icon className={cn("w-8 h-8", option.color)} />
                                        <span className="font-semibold text-lg">{option.label}</span>
                                        {preferences.major === option.id && (
                                            <div className="absolute top-4 right-4 text-primary">
                                                <Check className="w-5 h-5 bg-primary rounded-full text-black p-0.5" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Role */}
                    {step === 2 && (
                        <div className="w-full space-y-8 animate-in fade-in slide-in-from-right-8">
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-2">How do you identify?</h2>
                                <p className="text-white/60">Help us connect you with the right peers.</p>
                            </div>
                            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
                                {ROLES.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => updatePreference("role", option.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
                                            preferences.role === option.id
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            preferences.role === option.id ? "bg-white/20" : "bg-white/5"
                                        )}>
                                            <option.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-lg flex-1">{option.label}</span>
                                        {preferences.role === option.id && <Check className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20 mb-6">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-2">You're all set!</h2>
                                <p className="text-white/60 max-w-sm mx-auto">
                                    We've customized your experience. Get ready to collaborate with students worldwide.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                <DialogFooter className="sm:justify-between items-center border-t border-white/10 pt-6">
                    <Button
                        variant="ghost"
                        disabled={step === 1}
                        onClick={() => setStep(step - 1)}
                        className={step === 1 ? "invisible" : "text-white/50 hover:text-white"}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        size="lg"
                        className="bg-gradient-primary hover:opacity-90 shadow-glow px-8"
                    >
                        {step === 3 ? "Get Started" : "Continue"}
                        {step !== 3 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
