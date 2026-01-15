import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Get from local storage then parse stored json or return initialValue
    const readValue = (): T => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;

                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    // Dispatch a custom event so other hooks in the same window update
                    window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
                }

                return valueToStore;
            });
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        setStoredValue(readValue());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => {
        const handleStorageChange = (e: Event | CustomEvent) => {
            // Check if this specific key changed
            if (e instanceof StorageEvent && e.key !== key) return;
            // Check for custom event
            if (e instanceof CustomEvent && e.detail?.key !== key) return;

            setStoredValue(readValue());
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("local-storage", handleStorageChange as EventListener);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("local-storage", handleStorageChange as EventListener);
        };
    }, [key]);

    return [storedValue, setValue] as const;
}
