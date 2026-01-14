"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        // For meta/ctrl shortcuts, accept either
        const modifierMatch = shortcut.meta || shortcut.ctrl
          ? (e.metaKey || e.ctrlKey)
          : (ctrlMatch && metaMatch);

        if (keyMatch && modifierMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Preset shortcuts for common navigation
export function useNavigationShortcuts() {
  const router = useRouter();

  const shortcuts = React.useMemo<Shortcut[]>(() => [
    {
      key: "g",
      action: () => router.push("/deals"),
      description: "Go to Deals",
    },
    {
      key: "t",
      action: () => router.push("/tasks"),
      description: "Go to Tasks",
    },
    {
      key: "c",
      action: () => router.push("/contacts"),
      description: "Go to Contacts",
    },
    {
      key: "h",
      action: () => router.push("/dashboard"),
      description: "Go to Home/Dashboard",
    },
  ], [router]);

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

// Table-specific shortcuts
interface TableShortcutsProps {
  onNew?: () => void;
  onDelete?: () => void;
  onFilter?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export function useTableShortcuts({
  onNew,
  onDelete,
  onFilter,
  onSelectAll,
  onClearSelection,
}: TableShortcutsProps) {
  const shortcuts = React.useMemo<Shortcut[]>(() => {
    const list: Shortcut[] = [];

    if (onNew) {
      list.push({
        key: "n",
        action: onNew,
        description: "Create new item",
      });
    }

    if (onDelete) {
      list.push({
        key: "Backspace",
        action: onDelete,
        description: "Delete selected items",
      });
    }

    if (onFilter) {
      list.push({
        key: "f",
        action: onFilter,
        description: "Toggle filter panel",
      });
    }

    if (onSelectAll) {
      list.push({
        key: "a",
        meta: true,
        action: onSelectAll,
        description: "Select all",
      });
    }

    if (onClearSelection) {
      list.push({
        key: "Escape",
        action: onClearSelection,
        description: "Clear selection",
      });
    }

    return list;
  }, [onNew, onDelete, onFilter, onSelectAll, onClearSelection]);

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

// Hook to show keyboard shortcuts help
export function useShortcutsHelp() {
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setShowHelp((prev) => !prev);
        }
      }
      if (e.key === "Escape" && showHelp) {
        setShowHelp(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showHelp]);

  return { showHelp, setShowHelp };
}
