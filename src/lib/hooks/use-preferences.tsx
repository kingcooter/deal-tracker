"use client";

import * as React from "react";

export interface UserPreferences {
  // Appearance
  compactMode: boolean;
  showAnimations: boolean;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;

  // Data
  defaultDealsView: "grid" | "list";
  defaultSortOrder: "newest" | "oldest" | "name";
  itemsPerPage: number;
}

const defaultPreferences: UserPreferences = {
  compactMode: false,
  showAnimations: true,
  emailNotifications: true,
  pushNotifications: false,
  soundEnabled: true,
  defaultDealsView: "grid",
  defaultSortOrder: "newest",
  itemsPerPage: 12,
};

const STORAGE_KEY = "deal-tracker-preferences";

function getStoredPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(stored) };
  } catch {
    return defaultPreferences;
  }
}

function storePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage full or unavailable
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = React.useState<UserPreferences>(defaultPreferences);
  const [loaded, setLoaded] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    setPreferences(getStoredPreferences());
    setLoaded(true);
  }, []);

  const updatePreference = React.useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        storePreferences(updated);
        return updated;
      });
    },
    []
  );

  const resetPreferences = React.useCallback(() => {
    setPreferences(defaultPreferences);
    storePreferences(defaultPreferences);
  }, []);

  return {
    preferences,
    loaded,
    updatePreference,
    resetPreferences,
  };
}

// Context for global preference access
const PreferencesContext = React.createContext<{
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { preferences, updatePreference, loaded } = usePreferences();

  // Apply preferences as CSS classes/variables
  React.useEffect(() => {
    if (!loaded) return;

    // Compact mode
    document.documentElement.classList.toggle("compact-mode", preferences.compactMode);

    // Reduced motion
    document.documentElement.classList.toggle("reduce-motion", !preferences.showAnimations);
  }, [preferences, loaded]);

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferencesContext() {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferencesContext must be used within a PreferencesProvider");
  }
  return context;
}
