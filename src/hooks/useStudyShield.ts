import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Snapshot {
    timestamp: number;
    content: string;
}

const HISTORY_LIMIT = 10;
const SAVE_INTERVAL_MS = 30000; // 30 seconds

export function useStudyShield(noteId: string, initialContent: string = "") {
    // Key for persistent storage
    const storageKey = `noteverse_shield_${noteId}`;

    // State
    const [content, setContent] = useState<string>(initialContent);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState<Snapshot[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.content) {
                    setContent(parsed.content);
                    setLastSaved(new Date(parsed.timestamp));
                    if (parsed.history) {
                        setHistory(parsed.history);
                    }
                }
            } catch (e) {
                console.error("Study Shield: Corrupt data found", e);
            }
        }
    }, [noteId]);

    // Auto-save logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasUnsavedChanges) {
                saveNow();
            }
        }, SAVE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [content, hasUnsavedChanges]);

    const updateContent = (newContent: string) => {
        setContent(newContent);
        setHasUnsavedChanges(true);
    };

    const saveNow = () => {
        setIsSaving(true);

        // Create snapshot
        const now = Date.now();
        const newSnapshot: Snapshot = { timestamp: now, content };

        // Update history (keep last N)
        const newHistory = [newSnapshot, ...history].slice(0, HISTORY_LIMIT);
        setHistory(newHistory);

        // Persist to disk
        localStorage.setItem(storageKey, JSON.stringify({
            content,
            timestamp: now,
            history: newHistory
        }));

        setLastSaved(new Date(now));
        setHasUnsavedChanges(false);
        setIsSaving(false);
    };

    const restoreVersion = (snapshot: Snapshot) => {
        // Save current state before overwriting, just in case
        if (content.trim()) {
            const backupSnapshot = { timestamp: Date.now(), content };
            setHistory(prev => [backupSnapshot, ...prev].slice(0, HISTORY_LIMIT));
        }

        setContent(snapshot.content);
        setHasUnsavedChanges(true); // Trat restored content as "unsaved" so it syncs on next beat
        toast.info(`Restored version from ${new Date(snapshot.timestamp).toLocaleTimeString()}`);
    };

    return {
        content,
        updateContent,
        lastSaved,
        isSaving,
        hasUnsavedChanges,
        history,
        saveNow,
        restoreVersion
    };
}
