"use client";

import * as React from "react";
import { X, Building2, Calendar, Flag, Loader2 } from "lucide-react";
import { getDeals, getDealWorkflows, createTask } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";

interface QuickAddTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DealOption {
  id: string;
  name: string;
  workflows: { id: string; name: string | null }[];
}

export function QuickAddTask({ open, onOpenChange }: QuickAddTaskProps) {
  const toast = useToastActions();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [taskName, setTaskName] = React.useState("");
  const [selectedDeal, setSelectedDeal] = React.useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<string>("");
  const [priority, setPriority] = React.useState<string>("medium");
  const [dueDate, setDueDate] = React.useState<string>("");
  const [deals, setDeals] = React.useState<DealOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Load deals and their workflows
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      getDeals()
        .then(async (dealsList) => {
          const dealsWithWorkflows = await Promise.all(
            dealsList.map(async (deal) => {
              const workflows = await getDealWorkflows(deal.id);
              return {
                id: deal.id,
                name: deal.name,
                workflows: workflows.map((w) => ({
                  id: w.id,
                  name: w.name || w.template?.name || "Unnamed Workflow",
                })),
              };
            })
          );
          setDeals(dealsWithWorkflows.filter((d) => d.workflows.length > 0));
        })
        .finally(() => setLoading(false));

      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset form
      setTaskName("");
      setSelectedDeal("");
      setSelectedWorkflow("");
      setPriority("medium");
      setDueDate("");
    }
  }, [open]);

  // Update workflow when deal changes
  React.useEffect(() => {
    if (selectedDeal) {
      const deal = deals.find((d) => d.id === selectedDeal);
      if (deal && deal.workflows.length > 0) {
        setSelectedWorkflow(deal.workflows[0].id);
      }
    } else {
      setSelectedWorkflow("");
    }
  }, [selectedDeal, deals]);

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      toast.error("Task name required", "Please enter a task name");
      return;
    }

    if (!selectedWorkflow) {
      toast.error("Workflow required", "Please select a deal and workflow");
      return;
    }

    setSaving(true);
    try {
      await createTask({
        task: taskName.trim(),
        workflow_id: selectedWorkflow,
        status: "not_started",
        priority: priority as "low" | "medium" | "high" | "urgent",
        due_date: dueDate || null,
        notes: null,
        assignee_id: null,
        owner_id: null,
        sort_order: 0,
      });

      toast.success("Task created", taskName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task", "Please try again");
    } finally {
      setSaving(false);
    }
  };

  const currentDeal = deals.find((d) => d.id === selectedDeal);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1C1C1C] border border-[#3E3E3E] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
          <h2 className="text-[16px] font-medium text-[#EDEDED]">Quick Add Task</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="h-4 w-4 text-[#6B6B6B]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Task name */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full h-12 px-4 text-[15px] text-[#EDEDED] placeholder-[#6B6B6B] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg focus:outline-none focus:border-[#3ECF8E] transition-colors"
            />
          </div>

          {/* Deal & Workflow selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[#A1A1A1] mb-1.5">Deal</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                <select
                  value={selectedDeal}
                  onChange={(e) => setSelectedDeal(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 pl-9 pr-3 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg focus:outline-none focus:border-[#3ECF8E] cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select deal...</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-[#A1A1A1] mb-1.5">Workflow</label>
              <select
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                disabled={!selectedDeal || !currentDeal}
                className="w-full h-10 px-3 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg focus:outline-none focus:border-[#3ECF8E] cursor-pointer disabled:opacity-50"
              >
                <option value="">Select workflow...</option>
                {currentDeal?.workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[#A1A1A1] mb-1.5">Priority</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-[#A1A1A1] mb-1.5">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg focus:outline-none focus:border-[#3ECF8E] [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-[13px] text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !taskName.trim() || !selectedWorkflow}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#1C1C1C] bg-[#3ECF8E] rounded-lg hover:bg-[#4AE39A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>

        {/* Keyboard hint */}
        <div className="px-4 py-2 bg-[#2A2A2A]/50 border-t border-[#2A2A2A]">
          <p className="text-[11px] text-[#6B6B6B]">
            Press <kbd className="px-1 py-0.5 bg-[#1C1C1C] rounded text-[#A1A1A1]">Enter</kbd> to create ·{" "}
            <kbd className="px-1 py-0.5 bg-[#1C1C1C] rounded text-[#A1A1A1]">Esc</kbd> to cancel
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for managing quick add task state
export function useQuickAddTask() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + T to open quick add task
      if (e.shiftKey && e.key === "T" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}
