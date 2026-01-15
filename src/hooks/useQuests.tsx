import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useActivity, ActionType } from "@/hooks/useActivity";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Quest {
    id: string;
    label: string;
    xp: number;
    actionType: ActionType;
    target: number;
    completed: boolean;
    claimed: boolean;
}

interface QuestContextType {
    quests: Quest[];
    claimReward: (id: string) => Promise<void>;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const QUEST_POOL: Omit<Quest, 'completed' | 'claimed'>[] = [
    { id: "q1", label: "Create a new Note", xp: 50, actionType: 'create_note', target: 1 },
    { id: "q2", label: "Reply to a Peer", xp: 100, actionType: 'reply_peer', target: 1 },
    { id: "q3", label: "Complete 2 Focus Sessions", xp: 100, actionType: 'focus_session', target: 2 },
    { id: "q4", label: "Join a new Circle", xp: 50, actionType: 'join_circle', target: 1 },
    { id: "q5", label: "Upvote 3 useful notes", xp: 30, actionType: 'upvote_note', target: 3 },
    { id: "q6", label: "Update your Profile Bio", xp: 20, actionType: 'update_profile', target: 1 },
];

export function QuestProvider({ children }: { children: ReactNode }) {
    const { user, updateProfile } = useAuth();
    const { stats } = useActivity();
    const [quests, setQuests] = useLocalStorage<Quest[]>("daily-quests-v3", []);
    const [lastResetDate, setLastResetDate] = useLocalStorage<string>("daily-quests-date-v3", "");
    const { toast } = useToast();

    // 1. Daily Reset logic
    useEffect(() => {
        const checkReset = () => {
            const today = new Date().toDateString();
            if (today !== lastResetDate || quests.length === 0) {
                const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3).map(q => ({
                    ...q,
                    completed: false,
                    claimed: false
                }));

                setQuests(selected);
                setLastResetDate(today);
            }
        };

        checkReset();

        const interval = setInterval(checkReset, 60000); // Check every minute

        const handleFocus = () => checkReset();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [lastResetDate, quests.length, setQuests, setLastResetDate]);

    // 2. Logic to verify completion based on real activity
    useEffect(() => {
        // Prevent processing if stats are from a previous day (race condition with ActivityProvider)
        const today = new Date().toDateString();
        if (stats.date !== today) return;

        let hasChanges = false;

        const updatedQuests = quests.map(quest => {
            const currentCount = stats.actions[quest.actionType] || 0;
            const isFinished = currentCount >= quest.target;

            // Only update if state changes
            if (isFinished !== quest.completed) {
                hasChanges = true;
                if (isFinished) {
                    toast({
                        title: "Quest Completed!",
                        description: `You've completed "${quest.label}". Don't forget to claim your reward!`,
                        className: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400",
                        duration: 5000,
                    });
                }
                return { ...quest, completed: isFinished };
            }
            return quest;
        });

        // Deep check to prevent infinite loop
        if (hasChanges) {
            setQuests(updatedQuests);
        }
    }, [stats.actions, quests, setQuests, toast]);

    const claimReward = async (id: string) => {
        const questIndex = quests.findIndex(q => q.id === id);
        if (questIndex === -1) return;

        const quest = quests[questIndex];
        if (quest.claimed || !quest.completed) return;

        // Update State
        const newQuests = [...quests];
        newQuests[questIndex] = { ...quest, claimed: true };
        setQuests(newQuests);

        // Award Karma
        const currentKarma = user?.user_metadata?.karma || 0;
        await updateProfile({ karma: currentKarma + quest.xp });

        toast({
            title: "Reward Claimed!",
            description: `+${quest.xp} Karma added to your balance.`,
            className: "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        });

        // Bonus Check
        if (newQuests.every(q => q.claimed)) {
            toast({
                title: "Daily Bonus Unlocked!",
                description: "All quests done. +100 Bonus Karma!",
                className: "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
            });
            await updateProfile({ karma: (currentKarma + quest.xp) + 100 });
        }
    };

    return (
        <QuestContext.Provider value={{ quests, claimReward }}>
            {children}
        </QuestContext.Provider>
    );
}

export function useQuests() {
    const context = useContext(QuestContext);
    if (!context) {
        throw new Error("useQuests must be used within a QuestProvider");
    }
    return context;
}
