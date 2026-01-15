import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type ActionType =
    | 'create_note'
    | 'reply_peer'
    | 'focus_session'
    | 'join_circle'
    | 'upvote_note'
    | 'comment_note'
    | 'update_profile'
    | 'share_link';

interface DailyStats {
    date: string;
    actions: Record<ActionType, number>;
}

interface ActivityContextType {
    stats: DailyStats;
    trackAction: (action: ActionType, count?: number) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const INITIAL_STATS: DailyStats = {
    date: new Date().toDateString(),
    actions: {
        create_note: 0,
        reply_peer: 0,
        focus_session: 0,
        join_circle: 0,
        upvote_note: 0,
        comment_note: 0,
        update_profile: 0,
        share_link: 0
    }
};

export function ActivityProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useLocalStorage<DailyStats>("noteverse-daily-activity", INITIAL_STATS);

    // Reset daily
    useEffect(() => {
        const checkReset = () => {
            const today = new Date().toDateString();
            if (stats.date !== today) {
                setStats({ ...INITIAL_STATS, date: today });
            }
        };

        checkReset();

        // Check every minute
        const interval = setInterval(checkReset, 60000);

        // Check on window focus
        const handleFocus = () => checkReset();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [stats.date, setStats]);

    const trackAction = (action: ActionType, count = 1) => {
        setStats(prev => ({
            ...prev,
            actions: {
                ...prev.actions,
                [action]: (prev.actions[action] || 0) + count
            }
        }));
    };

    return (
        <ActivityContext.Provider value={{ stats, trackAction }}>
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error("useActivity must be used within an ActivityProvider");
    }
    return context;
}
