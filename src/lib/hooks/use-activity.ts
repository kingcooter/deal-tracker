"use client";

import * as React from "react";

export type ActivityType =
  | "deal_created"
  | "deal_updated"
  | "deal_deleted"
  | "deal_status_changed"
  | "contact_created"
  | "contact_updated"
  | "contact_deleted"
  | "task_created"
  | "task_completed"
  | "task_updated"
  | "workflow_added"
  | "note_added";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  entityType: "deal" | "contact" | "task" | "workflow";
  entityId: string;
  entityName: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const STORAGE_KEY = "deal-tracker-activity";
const MAX_ENTRIES = 100;

function getStoredActivity(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((entry: ActivityEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch {
    return [];
  }
}

function storeActivity(entries: ActivityEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep only the most recent entries
    const trimmed = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage might be full, clear old entries
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useActivity() {
  const [entries, setEntries] = React.useState<ActivityEntry[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    setEntries(getStoredActivity());
  }, []);

  const addEntry = React.useCallback(
    (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
      const newEntry: ActivityEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };

      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        storeActivity(updated);
        return updated;
      });

      return newEntry;
    },
    []
  );

  const clearActivity = React.useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getEntriesForEntity = React.useCallback(
    (entityType: string, entityId: string) => {
      return entries.filter(
        (e) => e.entityType === entityType && e.entityId === entityId
      );
    },
    [entries]
  );

  const getRecentEntries = React.useCallback(
    (count: number = 10) => {
      return entries.slice(0, count);
    },
    [entries]
  );

  return {
    entries,
    addEntry,
    clearActivity,
    getEntriesForEntity,
    getRecentEntries,
  };
}

// Helper functions to create activity entries
export function createDealActivity(
  type: "created" | "updated" | "deleted" | "status_changed",
  deal: { id: string; name: string },
  metadata?: Record<string, unknown>
): Omit<ActivityEntry, "id" | "timestamp"> {
  const descriptions: Record<string, string> = {
    created: `Created deal "${deal.name}"`,
    updated: `Updated deal "${deal.name}"`,
    deleted: `Deleted deal "${deal.name}"`,
    status_changed: `Changed status of "${deal.name}" to ${metadata?.newStatus || "unknown"}`,
  };

  return {
    type: `deal_${type}` as ActivityType,
    entityType: "deal",
    entityId: deal.id,
    entityName: deal.name,
    description: descriptions[type],
    metadata,
  };
}

export function createContactActivity(
  type: "created" | "updated" | "deleted",
  contact: { id: string; name: string },
  metadata?: Record<string, unknown>
): Omit<ActivityEntry, "id" | "timestamp"> {
  const descriptions: Record<string, string> = {
    created: `Added contact "${contact.name}"`,
    updated: `Updated contact "${contact.name}"`,
    deleted: `Removed contact "${contact.name}"`,
  };

  return {
    type: `contact_${type}` as ActivityType,
    entityType: "contact",
    entityId: contact.id,
    entityName: contact.name,
    description: descriptions[type],
    metadata,
  };
}

export function createTaskActivity(
  type: "created" | "completed" | "updated",
  task: { id: string; name: string },
  dealName?: string,
  metadata?: Record<string, unknown>
): Omit<ActivityEntry, "id" | "timestamp"> {
  const descriptions: Record<string, string> = {
    created: `Created task "${task.name}"${dealName ? ` in ${dealName}` : ""}`,
    completed: `Completed task "${task.name}"${dealName ? ` in ${dealName}` : ""}`,
    updated: `Updated task "${task.name}"${dealName ? ` in ${dealName}` : ""}`,
  };

  return {
    type: `task_${type}` as ActivityType,
    entityType: "task",
    entityId: task.id,
    entityName: task.name,
    description: descriptions[type],
    metadata,
  };
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}
