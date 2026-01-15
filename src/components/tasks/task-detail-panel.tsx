"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Building2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Flag,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToastActions } from "@/components/ui/toast";
import { updateTask, getContacts } from "@/lib/supabase/queries";
import { formatDistanceToNow, format } from "date-fns";
import type { Contact } from "@/lib/supabase/types";
import type { TaskWithDeal } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
  task: TaskWithDeal | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig: Record<string, { icon: typeof Circle; color: string; label: string; bg: string }> = {
  not_started: { icon: Circle, color: "#6B6B6B", label: "To Do", bg: "rgba(107, 107, 107, 0.15)" },
  in_progress: { icon: Clock, color: "#60A5FA", label: "In Progress", bg: "rgba(96, 165, 250, 0.15)" },
  blocked: { icon: AlertCircle, color: "#F87171", label: "Blocked", bg: "rgba(248, 113, 113, 0.15)" },
  completed: { icon: CheckCircle2, color: "#3ECF8E", label: "Done", bg: "rgba(62, 207, 142, 0.2)" },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: "#3ECF8E", label: "Low" },
  medium: { color: "#FBBF24", label: "Medium" },
  high: { color: "#F87171", label: "High" },
  urgent: { color: "#EF4444", label: "Urgent" },
};

export function TaskDetailPanel({ task, open, onClose }: TaskDetailPanelProps) {
  const queryClient = useQueryClient();
  const toast = useToastActions();

  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    task: "",
    status: "not_started",
    priority: "medium",
    due_date: "",
    assignee_id: "",
    notes: "",
  });

  // Fetch contacts for assignee dropdown
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: getContacts,
    staleTime: 60 * 1000,
  });

  // Initialize form when task changes
  React.useEffect(() => {
    if (task) {
      setEditForm({
        task: task.task,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        assignee_id: task.assignee?.id || "",
        notes: task.notes || "",
      });
      setIsEditing(false);
    }
  }, [task]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: {
      task?: string;
      status?: "not_started" | "in_progress" | "blocked" | "completed";
      priority?: "low" | "medium" | "high" | "urgent";
      due_date?: string | null;
      assignee_id?: string | null;
      notes?: string | null;
    }) => {
      if (!task) throw new Error("No task");
      return updateTask(task.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["deal-tasks"] });
      toast.success("Task updated", "Your changes have been saved");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update", "Please try again");
    },
  });

  const handleSave = () => {
    if (!editForm.task.trim()) {
      toast.error("Task name required", "Please enter a task name");
      return;
    }

    updateMutation.mutate({
      task: editForm.task.trim(),
      status: editForm.status as "not_started" | "in_progress" | "blocked" | "completed",
      priority: editForm.priority as "low" | "medium" | "high" | "urgent",
      due_date: editForm.due_date || null,
      assignee_id: editForm.assignee_id || null,
      notes: editForm.notes || null,
    });
  };

  const handleQuickStatusChange = (newStatus: string) => {
    if (!task) return;
    updateMutation.mutate({ status: newStatus as "not_started" | "in_progress" | "blocked" | "completed" });
  };

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !task) return null;

  const statusInfo = statusConfig[task.status] || statusConfig.not_started;
  const StatusIcon = statusInfo.icon;
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-background border-l border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuickStatusChange(task.status === "completed" ? "not_started" : "completed")}
              className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                task.status === "completed"
                  ? "bg-[#3ECF8E] border-[#3ECF8E]"
                  : "border-[#3E3E3E] hover:border-[#4E4E4E]"
              )}
            >
              {task.status === "completed" && (
                <CheckCircle2 className="h-4 w-4 text-[#1C1C1C]" />
              )}
            </button>
            <span className="text-sm font-medium text-foreground">Task Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-hover transition-colors"
          >
            <X className="h-5 w-5 text-foreground-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Task Name</label>
                <Input
                  value={editForm.task}
                  onChange={(e) => setEditForm({ ...editForm, task: e.target.value })}
                  placeholder="Task name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="not_started">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Done</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <Select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assignee</label>
                  <Select
                    value={editForm.assignee_id}
                    onChange={(e) => setEditForm({ ...editForm, assignee_id: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Add notes about this task..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <>
              {/* Task Name */}
              <div>
                <h2 className={cn(
                  "text-xl font-semibold text-foreground",
                  task.status === "completed" && "line-through opacity-60"
                )}>
                  {task.task}
                </h2>
                {task.workflow?.deal && (
                  <Link
                    href={`/deals/${task.workflow.deal.id}`}
                    className="flex items-center gap-1.5 mt-2 text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    <Building2 className="h-4 w-4" />
                    {task.workflow.deal.name}
                  </Link>
                )}
              </div>

              {/* Status & Priority Row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" style={{ color: statusInfo.color }} />
                  <span
                    className="text-sm px-2 py-0.5 rounded"
                    style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" style={{ color: priorityInfo.color }} />
                  <span className="text-sm text-foreground-muted">{priorityInfo.label} Priority</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Due Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </div>
                  <span className={cn(
                    "text-sm",
                    task.due_date
                      ? new Date(task.due_date) < new Date() && task.status !== "completed"
                        ? "text-error"
                        : "text-foreground"
                      : "text-foreground-muted"
                  )}>
                    {task.due_date
                      ? format(new Date(task.due_date), "MMM d, yyyy")
                      : "No due date"}
                  </span>
                </div>

                {/* Assignee */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <User className="h-4 w-4" />
                    Assignee
                  </div>
                  {task.assignee ? (
                    <Link
                      href={`/contacts/${task.assignee.id}`}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-[10px] font-medium text-[#A78BFA]">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      {task.assignee.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-foreground-muted italic">Unassigned</span>
                  )}
                </div>

                {/* Created */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Clock className="h-4 w-4" />
                    Created
                  </div>
                  <span className="text-sm text-foreground-muted">
                    {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Completed */}
                {task.completed_at && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <CheckCircle2 className="h-4 w-4 text-[#3ECF8E]" />
                      Completed
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{task.notes}</p>
                </div>
              )}

              {/* Edit Button */}
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  Edit Task
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
