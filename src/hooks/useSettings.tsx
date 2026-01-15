import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "light" | "dark" | "auto";
export type FontSize = "small" | "medium" | "large";
export type AnimationPreference = "on" | "off" | "reduced";
export type AIInspiration = "notion" | "duolingo" | "khan" | "coursera";

export interface NotificationSettings {
  enabled: boolean;
  circleAlerts: boolean;
  mentions: boolean;
  quests: boolean;
  marketing: boolean;
}

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  animationPreference: AnimationPreference;
  setAnimationPreference: (pref: AnimationPreference) => void;
  aiInspiration: AIInspiration;
  setAIInspiration: (inspiration: AIInspiration) => void;
  notifications: NotificationSettings;
  setNotifications: (settings: NotificationSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "noteverse-settings";

function getStoredSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: Partial<SettingsContextType>) {
  try {
    const current = getStoredSettings() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {
    // Ignore storage errors
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const stored = getStoredSettings();

  const [theme, setThemeState] = useState<Theme>(stored?.theme || "auto");
  const [fontSize, setFontSizeState] = useState<FontSize>(stored?.fontSize || "medium");
  const [animationPreference, setAnimationPreferenceState] = useState<AnimationPreference>(
    stored?.animationPreference || "on"
  );
  const [aiInspiration, setAIInspirationState] = useState<AIInspiration>(
    stored?.aiInspiration || "notion"
  );
  const [notifications, setNotificationsState] = useState<NotificationSettings>(
    stored?.notifications || {
      enabled: true,
      circleAlerts: true,
      mentions: true,
      quests: true,
      marketing: false
    }
  );

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-sm", "text-base", "text-lg");

    switch (fontSize) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "medium":
        root.style.fontSize = "16px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
    }
  }, [fontSize]);

  // Apply animation preference
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("reduce-motion", "no-motion");

    if (animationPreference === "off") {
      root.classList.add("no-motion");
    } else if (animationPreference === "reduced") {
      root.classList.add("reduce-motion");
    }
  }, [animationPreference]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    saveSettings({ theme: t });
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    saveSettings({ fontSize: s });
  };

  const setAnimationPreference = (p: AnimationPreference) => {
    setAnimationPreferenceState(p);
    saveSettings({ animationPreference: p });
  };

  const setAIInspiration = (i: AIInspiration) => {
    setAIInspirationState(i);
    saveSettings({ aiInspiration: i });
  };

  const setNotifications = (n: NotificationSettings) => {
    setNotificationsState(n);
    saveSettings({ notifications: n });
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        animationPreference,
        setAnimationPreference,
        aiInspiration,
        setAIInspiration,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
