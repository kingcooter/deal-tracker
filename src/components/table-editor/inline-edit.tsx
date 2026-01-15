"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X, Search, User } from "lucide-react";

// ============================================
// INLINE TEXT EDIT
// ============================================

interface InlineTextEditProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onTab?: (shiftKey: boolean) => void;
  className?: string;
  placeholder?: string;
}

export function InlineTextEdit({
  value,
  onSave,
  onCancel,
  onTab,
  className,
  placeholder,
}: InlineTextEditProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = React.useState(value);
  const savedRef = React.useRef(false);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      savedRef.current = true;
      onSave(localValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      savedRef.current = true;
      onCancel();
    } else if (e.key === "Tab" && onTab) {
      e.preventDefault();
      savedRef.current = true;
      onSave(localValue);
      // Small delay to allow save to complete
      setTimeout(() => onTab(e.shiftKey), 0);
    }
  };

  const handleBlur = () => {
    // Only auto-save if not already saved by keydown
    if (!savedRef.current) {
      onSave(localValue);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn(
        "w-full h-8 px-2 text-[13px] font-medium text-[#EDEDED] bg-[#2A2A2A]",
        "border-2 border-[#3ECF8E] rounded outline-none",
        "placeholder:text-[#6B6B6B]",
        className
      )}
    />
  );
}

// ============================================
// INLINE SELECT EDIT
// ============================================

interface SelectOption {
  value: string;
  label: string;
  bg?: string;
  text?: string;
}

interface InlineSelectEditProps {
  value: string;
  options: SelectOption[];
  onSave: (value: string) => void;
  onCancel: () => void;
  onTab?: (shiftKey: boolean) => void;
  className?: string;
}

export function InlineSelectEdit({
  value,
  options,
  onSave,
  onCancel,
  onTab,
  className,
}: InlineSelectEditProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(true);
  const [highlightedIndex, setHighlightedIndex] = React.useState(
    options.findIndex((o) => o.value === value)
  );

  const currentOption = options.find((o) => o.value === value);

  const handleSelect = React.useCallback((optionValue: string) => {
    onSave(optionValue);
    setIsOpen(false);
  }, [onSave]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Tab" && onTab) {
        e.preventDefault();
        onSave(value);
        setTimeout(() => onTab(e.shiftKey), 0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(options[highlightedIndex].value);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, onSave, onTab, value, highlightedIndex, options, handleSelect]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-8 px-2 text-[13px] bg-[#2A2A2A] border-2 border-[#3ECF8E] rounded outline-none"
      >
        {currentOption ? (
          <span
            className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded"
            style={{
              backgroundColor: currentOption.bg || "rgba(107, 107, 107, 0.15)",
              color: currentOption.text || "#6B6B6B",
            }}
          >
            {currentOption.label}
          </span>
        ) : (
          <span className="text-[#6B6B6B]">Select...</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-[#6B6B6B] flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[150px] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg shadow-lg overflow-hidden">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "flex items-center justify-between w-full h-9 px-3 text-left",
                "transition-colors",
                index === highlightedIndex
                  ? "bg-[#3E3E3E]"
                  : option.value === value
                    ? "bg-[#323232]"
                    : "hover:bg-[#323232]"
              )}
            >
              <span
                className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded"
                style={{
                  backgroundColor: option.bg || "rgba(107, 107, 107, 0.15)",
                  color: option.text || "#6B6B6B",
                }}
              >
                {option.label}
              </span>
              {option.value === value && (
                <Check className="h-3.5 w-3.5 text-[#3ECF8E]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// INLINE DATE EDIT
// ============================================

interface InlineDateEditProps {
  value: string | null;
  onSave: (value: string | null) => void;
  onCancel: () => void;
  className?: string;
}

export function InlineDateEdit({
  value,
  onSave,
  onCancel,
  className,
}: InlineDateEditProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = React.useState(value || "");

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(localValue || null);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(localValue || null);
  };

  const handleClear = () => {
    setLocalValue("");
    onSave(null);
  };

  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setLocalValue(today);
    onSave(today);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <input
        ref={inputRef}
        type="date"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn(
          "flex-1 h-8 px-2 text-[13px] text-[#EDEDED] bg-[#2A2A2A]",
          "border-2 border-[#3ECF8E] rounded outline-none",
          "[color-scheme:dark]"
        )}
      />
      <button
        onClick={setToday}
        className="h-8 px-2 text-[11px] text-[#A1A1A1] bg-[#2A2A2A] border border-[#3E3E3E] rounded hover:bg-[#323232] transition-colors"
      >
        Today
      </button>
      <button
        onClick={handleClear}
        className="h-8 w-8 flex items-center justify-center text-[#6B6B6B] bg-[#2A2A2A] border border-[#3E3E3E] rounded hover:bg-[#323232] hover:text-[#F87171] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ============================================
// INLINE CONTACT SELECT (for assignee)
// ============================================

interface ContactOption {
  id: string;
  name: string;
}

interface InlineContactSelectProps {
  value: string | null;
  contacts: ContactOption[];
  onSave: (value: string | null) => void;
  onCancel: () => void;
  className?: string;
}

export function InlineContactSelect({
  value,
  contacts,
  onSave,
  onCancel,
  className,
}: InlineContactSelectProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const currentContact = contacts.find((c) => c.id === value);

  // Filter contacts by search
  const filteredContacts = React.useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [contacts, search]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredContacts.length]);

  const handleSelect = React.useCallback((contactId: string | null) => {
    onSave(contactId);
  }, [onSave]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredContacts.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex === 0) {
        handleSelect(null); // Unassigned
      } else {
        handleSelect(filteredContacts[highlightedIndex - 1]?.id || null);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="flex items-center h-8 px-2 bg-[#2A2A2A] border-2 border-[#3ECF8E] rounded">
        <Search className="h-3.5 w-3.5 text-[#6B6B6B] mr-2 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentContact?.name || "Search contacts..."}
          className="flex-1 bg-transparent text-[13px] text-[#EDEDED] outline-none placeholder:text-[#6B6B6B]"
        />
      </div>

      {/* Dropdown */}
      <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[180px] max-h-[200px] overflow-y-auto bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg shadow-lg">
        {/* Unassigned option */}
        <button
          onClick={() => handleSelect(null)}
          onMouseEnter={() => setHighlightedIndex(0)}
          className={cn(
            "flex items-center gap-2 w-full h-9 px-3 text-left transition-colors",
            highlightedIndex === 0 ? "bg-[#3E3E3E]" : "hover:bg-[#323232]"
          )}
        >
          <User className="h-4 w-4 text-[#6B6B6B]" />
          <span className="text-[13px] text-[#6B6B6B] italic">Unassigned</span>
          {!value && <Check className="h-3.5 w-3.5 text-[#3ECF8E] ml-auto" />}
        </button>

        {/* Contact options */}
        {filteredContacts.map((contact, index) => (
          <button
            key={contact.id}
            onClick={() => handleSelect(contact.id)}
            onMouseEnter={() => setHighlightedIndex(index + 1)}
            className={cn(
              "flex items-center gap-2 w-full h-9 px-3 text-left transition-colors",
              highlightedIndex === index + 1 ? "bg-[#3E3E3E]" : "hover:bg-[#323232]"
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-[10px] font-medium text-[#A78BFA] flex-shrink-0">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] text-[#EDEDED] truncate">{contact.name}</span>
            {contact.id === value && <Check className="h-3.5 w-3.5 text-[#3ECF8E] ml-auto flex-shrink-0" />}
          </button>
        ))}

        {filteredContacts.length === 0 && search && (
          <div className="px-3 py-2 text-[12px] text-[#6B6B6B]">
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
}
