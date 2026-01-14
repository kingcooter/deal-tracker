"use client";

import * as React from "react";
import {
  Check,
  Circle,
  Clock,
  AlertCircle,
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  CheckSquare,
  Square,
  X,
  Calendar,
  Flag,
  User,
} from "lucide-react";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToastActions } from "@/components/ui/toast";

export interface Task {
  id: string;
  task: string;
  status: "not_started" | "in_progress" | "blocked" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  owner: string | null;
  assignee: string | null;
  opened_at: string;
  due_date: string | null;
}

interface TasksTableProps {
  tasks: Task[];
  workflowId: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskAdd?: (task: Omit<Task, "id">) => void;
  onTaskDelete?: (taskId: string) => void;
}

const statusConfig = {
  not_started: {
    label: "To Do",
    icon: Circle,
    badge: "secondary" as const,
    bg: "rgba(107, 107, 107, 0.15)",
    text: "#6B6B6B",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    badge: "info" as const,
    bg: "rgba(96, 165, 250, 0.15)",
    text: "#60A5FA",
  },
  blocked: {
    label: "Blocked",
    icon: AlertCircle,
    badge: "error" as const,
    bg: "rgba(248, 113, 113, 0.15)",
    text: "#F87171",
  },
  completed: {
    label: "Done",
    icon: Check,
    badge: "success" as const,
    bg: "rgba(62, 207, 142, 0.2)",
    text: "#3ECF8E",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "#3ECF8E", bg: "rgba(62, 207, 142, 0.15)" },
  medium: { label: "Medium", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)" },
  high: { label: "High", color: "#F87171", bg: "rgba(248, 113, 113, 0.15)" },
  urgent: { label: "Urgent", color: "#EF4444", bg: "rgba(239, 68, 68, 0.2)" },
};

type SortKey = "task" | "status" | "priority" | "due_date";
type SortDirection = "asc" | "desc";

interface EditingCell {
  taskId: string;
  field: string;
}

export function TasksTable({
  tasks,
  workflowId,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete,
}: TasksTableProps) {
  const toast = useToastActions();
  const [sortKey, setSortKey] = React.useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null);
  const [showAddRow, setShowAddRow] = React.useState(false);
  const [newTaskName, setNewTaskName] = React.useState("");
  const [selectedTasks, setSelectedTasks] = React.useState<Set<string>>(new Set());
  const [editValue, setEditValue] = React.useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedTasks = React.useMemo(() => {
    if (!sortKey) return tasks;

    return [...tasks].sort((a, b) => {
      let aVal: string | number | null = a[sortKey];
      let bVal: string | number | null = b[sortKey];

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (sortKey === "priority") {
        const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        aVal = order[a.priority];
        bVal = order[b.priority];
      }

      if (sortKey === "status") {
        const order: Record<string, number> = { blocked: 0, in_progress: 1, not_started: 2, completed: 3 };
        aVal = order[a.status];
        bVal = order[b.status];
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [tasks, sortKey, sortDirection]);

  const handleStatusChange = (taskId: string, status: Task["status"]) => {
    onTaskUpdate?.(taskId, { status });
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;

    onTaskAdd?.({
      task: newTaskName,
      status: "not_started",
      priority: "medium",
      owner: null,
      assignee: null,
      opened_at: new Date().toISOString(),
      due_date: null,
    });

    setNewTaskName("");
    setShowAddRow(false);
  };

  // Start editing a cell
  const startEditing = (taskId: string, field: string, currentValue: string) => {
    setEditingCell({ taskId, field });
    setEditValue(currentValue);
  };

  // Save editing
  const saveEdit = (taskId: string, field: string, value: string | null) => {
    if (field === "task" && !value?.trim()) {
      setEditingCell(null);
      return;
    }
    onTaskUpdate?.(taskId, { [field]: value });
    setEditingCell(null);
    setEditValue("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Bulk selection
  const toggleSelect = (taskId: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map((t) => t.id)));
    }
  };

  // Bulk actions
  const handleBulkComplete = () => {
    selectedTasks.forEach((taskId) => {
      onTaskUpdate?.(taskId, { status: "completed" });
    });
    toast.success("Tasks completed", `${selectedTasks.size} tasks marked as done`);
    setSelectedTasks(new Set());
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedTasks.size} tasks?`)) return;
    selectedTasks.forEach((taskId) => {
      onTaskDelete?.(taskId);
    });
    toast.success("Tasks deleted", `${selectedTasks.size} tasks removed`);
    setSelectedTasks(new Set());
  };

  const isEditing = (taskId: string, field: string) => {
    return editingCell?.taskId === taskId && editingCell?.field === field;
  };

  const SortHeader = ({
    children,
    sortKeyName,
    className,
  }: {
    children: React.ReactNode;
    sortKeyName: SortKey;
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className={cn(
        "flex items-center gap-1 hover:text-[#EDEDED] transition-colors",
        className
      )}
    >
      {children}
      {sortKey === sortKeyName && (
        sortDirection === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      )}
    </button>
  );

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="overflow-x-auto">
      {/* Bulk actions bar */}
      {selectedTasks.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[#60A5FA]/10 border-b border-[#60A5FA]/20">
          <span className="text-[12px] text-[#60A5FA] font-medium">
            {selectedTasks.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#3ECF8E] bg-[#3ECF8E]/10 rounded hover:bg-[#3ECF8E]/20 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Complete All
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#F87171] bg-[#F87171]/10 rounded hover:bg-[#F87171]/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              onClick={() => setSelectedTasks(new Set())}
              className="p-1 text-[#6B6B6B] hover:text-[#EDEDED] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#3E3E3E] text-left text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider">
            <th className="w-8 px-3 py-2">
              <button onClick={toggleSelectAll} className="flex items-center justify-center">
                {selectedTasks.size === tasks.length && tasks.length > 0 ? (
                  <CheckSquare className="h-4 w-4 text-[#60A5FA]" />
                ) : selectedTasks.size > 0 ? (
                  <div className="h-4 w-4 rounded border border-[#60A5FA] bg-[#60A5FA]/30" />
                ) : (
                  <Square className="h-4 w-4 text-[#6B6B6B]" />
                )}
              </button>
            </th>
            <th className="w-8 px-1 py-2"></th>
            <th className="px-3 py-2 min-w-[200px]">
              <SortHeader sortKeyName="task">Task</SortHeader>
            </th>
            <th className="w-32 px-3 py-2">
              <SortHeader sortKeyName="status">Status</SortHeader>
            </th>
            <th className="w-24 px-3 py-2">
              <SortHeader sortKeyName="priority">Priority</SortHeader>
            </th>
            <th className="w-32 px-3 py-2">Assignee</th>
            <th className="w-28 px-3 py-2">
              <SortHeader sortKeyName="due_date">Due Date</SortHeader>
            </th>
            <th className="w-10 px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            const overdue = task.status !== "completed" && isOverdue(task.due_date);
            const isSelected = selectedTasks.has(task.id);

            return (
              <tr
                key={task.id}
                className={cn(
                  "group border-b border-[#2A2A2A] last:border-0",
                  "hover:bg-[#2A2A2A]/50 transition-colors",
                  task.status === "completed" && "opacity-60",
                  isSelected && "bg-[#60A5FA]/5"
                )}
              >
                {/* Checkbox */}
                <td className="px-3 py-2">
                  <button onClick={() => toggleSelect(task.id)} className="flex items-center justify-center">
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-[#60A5FA]" />
                    ) : (
                      <Square className="h-4 w-4 text-[#6B6B6B] group-hover:text-[#A1A1A1]" />
                    )}
                  </button>
                </td>

                {/* Drag handle */}
                <td className="px-1 py-2">
                  <GripVertical className="h-4 w-4 text-[#6B6B6B] opacity-0 group-hover:opacity-100 cursor-grab" />
                </td>

                {/* Task name - inline editable */}
                <td className="px-3 py-2">
                  {isEditing(task.id, "task") ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(task.id, "task", editValue)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(task.id, "task", editValue);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full px-2 py-1 text-[13px] bg-[#1C1C1C] border border-[#60A5FA] rounded text-[#EDEDED] focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEditing(task.id, "task", task.task)}
                      className={cn(
                        "text-[13px] text-[#EDEDED] cursor-text hover:bg-[#2A2A2A] px-2 py-1 -mx-2 rounded",
                        task.status === "completed" && "line-through text-[#6B6B6B]"
                      )}
                    >
                      {task.task}
                    </span>
                  )}
                </td>

                {/* Status - inline dropdown */}
                <td className="px-3 py-2">
                  {isEditing(task.id, "status") ? (
                    <div className="relative">
                      <select
                        value={editValue}
                        onChange={(e) => {
                          saveEdit(task.id, "status", e.target.value);
                        }}
                        onBlur={cancelEdit}
                        className="w-full px-2 py-1 text-[12px] bg-[#1C1C1C] border border-[#60A5FA] rounded text-[#EDEDED] focus:outline-none appearance-none cursor-pointer"
                        autoFocus
                      >
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(task.id, "status", task.status)}
                      className="focus:outline-none"
                    >
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-[12px] rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: statusConfig[task.status].bg,
                          color: statusConfig[task.status].text,
                        }}
                      >
                        <StatusIcon className="h-3 w-3 flex-shrink-0" />
                        {statusConfig[task.status].label}
                      </span>
                    </button>
                  )}
                </td>

                {/* Priority - inline dropdown */}
                <td className="px-3 py-2">
                  {isEditing(task.id, "priority") ? (
                    <select
                      value={editValue}
                      onChange={(e) => {
                        saveEdit(task.id, "priority", e.target.value);
                      }}
                      onBlur={cancelEdit}
                      className="w-full px-2 py-1 text-[12px] bg-[#1C1C1C] border border-[#60A5FA] rounded text-[#EDEDED] focus:outline-none appearance-none cursor-pointer"
                      autoFocus
                    >
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => startEditing(task.id, "priority", task.priority)}
                      className="focus:outline-none"
                    >
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: priorityConfig[task.priority].bg,
                          color: priorityConfig[task.priority].color,
                        }}
                      >
                        <Flag className="h-3 w-3 flex-shrink-0" />
                        {priorityConfig[task.priority].label}
                      </span>
                    </button>
                  )}
                </td>

                {/* Assignee - inline editable */}
                <td className="px-3 py-2">
                  {isEditing(task.id, "assignee") ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(task.id, "assignee", editValue || null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(task.id, "assignee", editValue || null);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      placeholder="Unassigned"
                      className="w-full px-2 py-1 text-[12px] bg-[#1C1C1C] border border-[#60A5FA] rounded text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none"
                      autoFocus
                    />
                  ) : task.assignee ? (
                    <button
                      onClick={() => startEditing(task.id, "assignee", task.assignee || "")}
                      className="flex items-center gap-2 hover:bg-[#2A2A2A] px-2 py-1 -mx-2 rounded"
                    >
                      <Avatar alt={task.assignee} size="sm" />
                      <span className="text-[12px] text-[#A1A1A1] truncate max-w-[80px]">
                        {task.assignee}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(task.id, "assignee", "")}
                      className="flex items-center gap-1.5 px-2 py-1 -mx-2 text-[12px] text-[#6B6B6B] hover:text-[#A1A1A1] hover:bg-[#2A2A2A] rounded transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Assign</span>
                    </button>
                  )}
                </td>

                {/* Due date - inline editable */}
                <td className="px-3 py-2">
                  {isEditing(task.id, "due_date") ? (
                    <input
                      type="date"
                      value={editValue}
                      onChange={(e) => {
                        saveEdit(task.id, "due_date", e.target.value || null);
                      }}
                      onBlur={cancelEdit}
                      className="w-full px-2 py-1 text-[12px] bg-[#1C1C1C] border border-[#60A5FA] rounded text-[#EDEDED] focus:outline-none"
                      autoFocus
                    />
                  ) : task.due_date ? (
                    <button
                      onClick={() => startEditing(task.id, "due_date", task.due_date || "")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 -mx-2 text-[12px] rounded hover:bg-[#2A2A2A] transition-colors",
                        overdue ? "text-[#F87171]" : "text-[#A1A1A1]"
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      {formatRelativeDate(task.due_date)}
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(task.id, "due_date", "")}
                      className="flex items-center gap-1.5 px-2 py-1 -mx-2 text-[12px] text-[#6B6B6B] hover:text-[#A1A1A1] hover:bg-[#2A2A2A] rounded transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Set date</span>
                    </button>
                  )}
                </td>

                {/* Actions */}
                <td className="px-2 py-2">
                  <button
                    onClick={() => {
                      if (confirm("Delete this task?")) {
                        onTaskDelete?.(task.id);
                      }
                    }}
                    className="rounded-md p-1 opacity-0 group-hover:opacity-100 text-[#6B6B6B] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}

          {/* Add task row */}
          {showAddRow ? (
            <tr className="border-b border-[#2A2A2A]">
              <td className="px-3 py-2"></td>
              <td className="px-1 py-2"></td>
              <td colSpan={5} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Task name..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask();
                      if (e.key === "Escape") {
                        setShowAddRow(false);
                        setNewTaskName("");
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-[13px] bg-[#1C1C1C] border border-[#3E3E3E] rounded text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none focus:border-[#60A5FA]"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddTask}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddRow(false);
                      setNewTaskName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </td>
              <td></td>
            </tr>
          ) : (
            <tr>
              <td colSpan={8} className="px-3 py-2">
                <button
                  onClick={() => setShowAddRow(true)}
                  className="flex items-center gap-2 text-[13px] text-[#6B6B6B] hover:text-[#EDEDED] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add task
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Empty state */}
      {tasks.length === 0 && !showAddRow && (
        <div className="py-8 text-center">
          <p className="text-[13px] text-[#6B6B6B] mb-3">No tasks yet</p>
          <button
            onClick={() => setShowAddRow(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#60A5FA] border border-[#60A5FA]/30 rounded hover:bg-[#60A5FA]/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add first task
          </button>
        </div>
      )}
    </div>
  );
}
