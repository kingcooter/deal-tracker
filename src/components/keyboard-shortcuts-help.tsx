"use client";

import * as React from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutCategory {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G"], description: "Go to Deals" },
      { keys: ["T"], description: "Go to Tasks" },
      { keys: ["C"], description: "Go to Contacts" },
      { keys: ["H"], description: "Go to Dashboard" },
    ],
  },
  {
    title: "Table Actions",
    shortcuts: [
      { keys: ["N"], description: "Create new item" },
      { keys: ["⌘", "A"], description: "Select all" },
      { keys: ["⌫"], description: "Delete selected" },
      { keys: ["F"], description: "Toggle filters" },
      { keys: ["Esc"], description: "Clear selection / Cancel" },
    ],
  },
  {
    title: "Quick Actions",
    shortcuts: [
      { keys: ["⇧", "T"], description: "Quick add task" },
      { keys: ["⇧", "D"], description: "Quick add deal" },
      { keys: ["/"], description: "Focus search" },
      { keys: ["?"], description: "Toggle this help" },
    ],
  },
  {
    title: "Editing",
    shortcuts: [
      { keys: ["Enter"], description: "Save edit" },
      { keys: ["Esc"], description: "Cancel edit" },
      { keys: ["Tab"], description: "Next field" },
      { keys: ["⇧", "Tab"], description: "Previous field" },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#1C1C1C] border border-[#3E3E3E] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3E3E3E]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2A2A2A] rounded-lg">
              <Keyboard className="h-5 w-5 text-[#60A5FA]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#EDEDED]">
                Keyboard Shortcuts
              </h2>
              <p className="text-[13px] text-[#6B6B6B]">
                Navigate faster with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 text-[#6B6B6B] hover:text-[#EDEDED] hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutCategories.map((category) => (
              <div key={category.title}>
                <h3 className="text-[12px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-[13px] text-[#A1A1A1]">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <kbd
                            key={j}
                            className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-medium text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#2A2A2A]/50 border-t border-[#3E3E3E]">
          <p className="text-[12px] text-[#6B6B6B] text-center">
            Press <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-medium text-[#EDEDED] bg-[#3E3E3E] rounded mx-1">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}

// Small floating indicator button
interface KeyboardShortcutsButtonProps {
  onClick: () => void;
}

export function KeyboardShortcutsButton({ onClick }: KeyboardShortcutsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 text-[12px] text-[#6B6B6B] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg hover:text-[#EDEDED] hover:border-[#4E4E4E] transition-colors shadow-lg"
      title="Keyboard shortcuts (?)"
    >
      <Keyboard className="h-4 w-4" />
      <span>?</span>
    </button>
  );
}
