"use client";

import * as React from "react";
import {
  Settings,
  Bell,
  User,
  Palette,
  Database,
  Keyboard,
  RotateCcw,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ToggleWithLabel } from "@/components/ui/toggle";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { useToastActions } from "@/components/ui/toast";

export default function SettingsPage() {
  const { preferences, updatePreference, resetPreferences, loaded } = usePreferences();
  const toast = useToastActions();
  const [saved, setSaved] = React.useState(false);

  const handleReset = () => {
    resetPreferences();
    toast.success("Settings reset", "All preferences have been restored to defaults");
  };

  // Show saved indicator briefly when preference changes
  React.useEffect(() => {
    if (loaded) {
      setSaved(true);
      const timer = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [preferences, loaded]);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-foreground-muted">
            Manage your account and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-success animate-fade-in">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to defaults
          </Button>
        </div>
      </div>

      {/* Settings sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Appearance</h3>
              <p className="text-sm text-foreground-muted">
                Customize the look and feel
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ToggleWithLabel
              label="Compact mode"
              description="Reduce spacing for a denser layout"
              checked={preferences.compactMode}
              onChange={(checked) => updatePreference("compactMode", checked)}
            />
            <ToggleWithLabel
              label="Show animations"
              description="Enable smooth transitions and effects"
              checked={preferences.showAnimations}
              onChange={(checked) => updatePreference("showAnimations", checked)}
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Notifications</h3>
              <p className="text-sm text-foreground-muted">
                Configure how you receive updates
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ToggleWithLabel
              label="Email notifications"
              description="Receive updates via email"
              checked={preferences.emailNotifications}
              onChange={(checked) => updatePreference("emailNotifications", checked)}
            />
            <ToggleWithLabel
              label="Push notifications"
              description="Browser push notifications"
              checked={preferences.pushNotifications}
              onChange={(checked) => updatePreference("pushNotifications", checked)}
            />
            <ToggleWithLabel
              label="Sound effects"
              description="Play sounds for notifications"
              checked={preferences.soundEnabled}
              onChange={(checked) => updatePreference("soundEnabled", checked)}
            />
          </div>
        </Card>

        {/* Data & Display */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Data & Display</h3>
              <p className="text-sm text-foreground-muted">
                Control how data is displayed
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Default deals view
              </label>
              <Select
                value={preferences.defaultDealsView}
                onChange={(e) =>
                  updatePreference("defaultDealsView", e.target.value as "grid" | "list")
                }
              >
                <option value="grid">Grid view</option>
                <option value="list">List view</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Default sort order
              </label>
              <Select
                value={preferences.defaultSortOrder}
                onChange={(e) =>
                  updatePreference(
                    "defaultSortOrder",
                    e.target.value as "newest" | "oldest" | "name"
                  )
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Alphabetical</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Items per page
              </label>
              <Select
                value={String(preferences.itemsPerPage)}
                onChange={(e) =>
                  updatePreference("itemsPerPage", parseInt(e.target.value))
                }
              >
                <option value="6">6 items</option>
                <option value="12">12 items</option>
                <option value="24">24 items</option>
                <option value="48">48 items</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Keyboard shortcuts */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Keyboard Shortcuts</h3>
              <p className="text-sm text-foreground-muted">
                Quick actions via keyboard
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Open search</span>
              <kbd className="px-2 py-1 rounded bg-surface-hover text-xs">⌘K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Go to deals</span>
              <kbd className="px-2 py-1 rounded bg-surface-hover text-xs">G then D</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Go to contacts</span>
              <kbd className="px-2 py-1 rounded bg-surface-hover text-xs">G then C</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Go to settings</span>
              <kbd className="px-2 py-1 rounded bg-surface-hover text-xs">G then S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Show all shortcuts</span>
              <kbd className="px-2 py-1 rounded bg-surface-hover text-xs">?</kbd>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
