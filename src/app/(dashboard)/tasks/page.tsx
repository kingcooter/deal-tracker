"use client";

import * as React from "react";
import Link from "next/link";
import { CheckSquare, Building2, Check, LayoutList, Layers, ChevronDown, ChevronRight, Kanban } from "lucide-react";
import {
  TableLayout,
  Toolbar,
  Pagination,
  DataTable,
  StatusBadge,
  PriorityBadge,
  InlineTextEdit,
  InlineSelectEdit,
  InlineDateEdit,
} from "@/components/table-editor";
import { TaskKanban } from "@/components/tasks/task-kanban";
import { useToastActions } from "@/components/ui/toast";
import { getAllTasks, updateTask } from "@/lib/supabase/queries";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grouped" | "kanban";

// Task status mapping
const taskStatusMap: Record<string, { bg: string; text: string; label: string }> = {
  not_started: {
    bg: "rgba(107, 107, 107, 0.15)",
    text: "#6B6B6B",
    label: "To Do",
  },
  in_progress: {
    bg: "rgba(96, 165, 250, 0.15)",
    text: "#60A5FA",
    label: "In Progress",
  },
  blocked: {
    bg: "rgba(248, 113, 113, 0.15)",
    text: "#F87171",
    label: "Blocked",
  },
  completed: {
    bg: "rgba(62, 207, 142, 0.2)",
    text: "#3ECF8E",
    label: "Done",
  },
};

// Status options for inline select
const taskStatusOptions = [
  { value: "not_started", label: "To Do", bg: "rgba(107, 107, 107, 0.15)", text: "#6B6B6B" },
  { value: "in_progress", label: "In Progress", bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA" },
  { value: "blocked", label: "Blocked", bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
  { value: "completed", label: "Done", bg: "rgba(62, 207, 142, 0.2)", text: "#3ECF8E" },
];

// Priority options for inline select
const priorityOptions = [
  { value: "high", label: "High", bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
  { value: "medium", label: "Medium", bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  { value: "low", label: "Low", bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E" },
];

interface TaskWithDeal {
  id: string;
  task: string;
  status: string;
  priority: string;
  due_date: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  workflow_id: string;
  assignee: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
  workflow: {
    id: string;
    deal_id: string;
    name: string | null;
    deal: { id: string; name: string; status: string } | null;
  } | null;
}

interface EditingCell {
  rowId: string;
  columnId: string;
}

export default function TasksPage() {
  const toast = useToastActions();
  const [tasks, setTasks] = React.useState<TaskWithDeal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  // Fetch tasks
  React.useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getAllTasks();
        setTasks(data as TaskWithDeal[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks", "Please refresh the page");
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  // Handle task completion toggle
  const handleToggleComplete = async (e: React.MouseEvent, task: TaskWithDeal) => {
    e.stopPropagation();
    const newStatus = task.status === "completed" ? "not_started" : "completed";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(task.id, { status: newStatus });
      toast.success(
        newStatus === "completed" ? "Task completed" : "Task reopened",
        task.task
      );
    } catch (error) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      toast.error("Failed to update task", "Please try again");
    }
  };

  // Handle double-click to edit cell
  const handleRowDoubleClick = (task: TaskWithDeal, columnId: string) => {
    // Only allow editing on editable columns
    if (["title", "status", "priority", "due_date"].includes(columnId)) {
      setEditingCell({ rowId: task.id, columnId });
    }
  };

  // Handle inline edit save
  const handleInlineSave = async (taskId: string, field: string, value: string | null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const dbField = field === "title" ? "task" : field;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [dbField]: value } : t))
    );
    setEditingCell(null);

    try {
      await updateTask(taskId, { [dbField]: value });
      toast.success("Updated", `Task ${field.replace("_", " ")} updated`);
    } catch (error) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? task : t))
      );
      toast.error("Failed to update", "Please try again");
    }
  };

  // Handle inline edit cancel
  const handleInlineCancel = () => {
    setEditingCell(null);
  };

  // Check if a cell is being edited
  const isEditing = (taskId: string, columnId: string) => {
    return editingCell?.rowId === taskId && editingCell?.columnId === columnId;
  };

  // Group tasks by deal
  const groupedTasks = React.useMemo(() => {
    const groups: Map<string, { deal: { id: string; name: string } | null; tasks: TaskWithDeal[] }> = new Map();

    tasks.forEach((task) => {
      const dealId = task.workflow?.deal?.id || "unassigned";
      const dealName = task.workflow?.deal?.name || "Unassigned";

      if (!groups.has(dealId)) {
        groups.set(dealId, {
          deal: task.workflow?.deal || null,
          tasks: [],
        });
      }
      groups.get(dealId)!.tasks.push(task);
    });

    return Array.from(groups.entries()).map(([id, data]) => ({
      dealId: id,
      deal: data.deal,
      tasks: data.tasks,
      pendingCount: data.tasks.filter((t) => t.status !== "completed").length,
    }));
  }, [tasks]);

  // Initialize expanded groups
  React.useEffect(() => {
    if (viewMode === "grouped" && expandedGroups.size === 0) {
      // Expand all groups by default
      setExpandedGroups(new Set(groupedTasks.map((g) => g.dealId)));
    }
  }, [viewMode, groupedTasks, expandedGroups.size]);

  // Toggle group expansion
  const toggleGroup = (dealId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  // Pagination (only in list mode)
  const totalPages = viewMode === "list" ? Math.ceil(tasks.length / rowsPerPage) : 1;
  const paginatedTasks = React.useMemo(() => {
    if (viewMode !== "list") return tasks;
    const start = (currentPage - 1) * rowsPerPage;
    return tasks.slice(start, start + rowsPerPage);
  }, [tasks, currentPage, rowsPerPage, viewMode]);

  // Selection
  const isAllSelected = selectedIds.size === paginatedTasks.length && paginatedTasks.length > 0;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < paginatedTasks.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTasks.map((t) => t.id)));
    }
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Format due date
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "—", className: "text-[#6B6B6B]" };

    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) {
      return { text: format(date, "MMM d"), className: "text-[#F87171]" };
    }
    if (isToday(date)) {
      return { text: "Today", className: "text-[#FBBF24]" };
    }
    return { text: format(date, "MMM d"), className: "text-[#A1A1A1]" };
  };

  // Table columns
  const columns = [
    {
      id: "done",
      header: "Done",
      width: "60px",
      render: (task: TaskWithDeal) => {
        const isCompleted = task.status === "completed";
        return (
          <button
            onClick={(e) => handleToggleComplete(e, task)}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              isCompleted
                ? "bg-[#3ECF8E] border-[#3ECF8E]"
                : "border-[#3E3E3E] hover:border-[#4E4E4E]"
            }`}
          >
            {isCompleted && <Check className="h-3 w-3 text-[#1C1C1C]" />}
          </button>
        );
      },
    },
    {
      id: "title",
      header: "Title",
      width: "25%",
      render: (task: TaskWithDeal) => {
        const isCompleted = task.status === "completed";
        return isEditing(task.id, "title") ? (
          <InlineTextEdit
            value={task.task}
            onSave={(value) => handleInlineSave(task.id, "title", value)}
            onCancel={handleInlineCancel}
          />
        ) : (
          <span
            className={`text-[13px] font-medium truncate block ${
              isCompleted
                ? "text-[#6B6B6B] line-through opacity-60"
                : "text-[#EDEDED]"
            }`}
          >
            {task.task}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      width: "12%",
      render: (task: TaskWithDeal) =>
        isEditing(task.id, "status") ? (
          <InlineSelectEdit
            value={task.status}
            options={taskStatusOptions}
            onSave={(value) => handleInlineSave(task.id, "status", value)}
            onCancel={handleInlineCancel}
          />
        ) : (
          <StatusBadge status={task.status} statusMap={taskStatusMap} />
        ),
    },
    {
      id: "priority",
      header: "Priority",
      width: "10%",
      render: (task: TaskWithDeal) =>
        isEditing(task.id, "priority") ? (
          <InlineSelectEdit
            value={task.priority}
            options={priorityOptions}
            onSave={(value) => handleInlineSave(task.id, "priority", value)}
            onCancel={handleInlineCancel}
          />
        ) : (
          <PriorityBadge priority={task.priority} />
        ),
    },
    {
      id: "due_date",
      header: "Due Date",
      width: "15%",
      render: (task: TaskWithDeal) => {
        if (isEditing(task.id, "due_date")) {
          return (
            <InlineDateEdit
              value={task.due_date}
              onSave={(value) => handleInlineSave(task.id, "due_date", value)}
              onCancel={handleInlineCancel}
            />
          );
        }
        const due = formatDueDate(task.due_date);
        return <span className={`text-[13px] ${due.className}`}>{due.text}</span>;
      },
    },
    {
      id: "deal",
      header: "Deal",
      width: "20%",
      render: (task: TaskWithDeal) =>
        task.workflow?.deal ? (
          <Link
            href={`/deals/${task.workflow.deal.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[13px] text-[#A1A1A1] hover:text-[#60A5FA] transition-colors truncate"
          >
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{task.workflow.deal.name}</span>
          </Link>
        ) : (
          <span className="text-[13px] text-[#6B6B6B]">—</span>
        ),
    },
    {
      id: "assignee",
      header: "Assignee",
      width: "15%",
      render: (task: TaskWithDeal) =>
        task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-[10px] font-medium text-[#A78BFA]">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] text-[#A1A1A1] truncate">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-[#6B6B6B] italic">Unassigned</span>
        ),
    },
  ];

  if (loading) {
    return (
      <TableLayout activeTable="tasks">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[13px] text-[#6B6B6B]">Loading tasks...</div>
        </div>
      </TableLayout>
    );
  }

  return (
    <TableLayout activeTable="tasks">
      {/* Toolbar */}
      <Toolbar
        onNewClick={() => toast.info("Add tasks from a deal", "Navigate to a deal to add tasks to its workflows")}
        newButtonLabel="New Task"
      >
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-md p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 text-[12px] rounded transition-colors",
              viewMode === "list"
                ? "bg-[#3E3E3E] text-[#EDEDED]"
                : "text-[#6B6B6B] hover:text-[#A1A1A1]"
            )}
          >
            <LayoutList className="h-3.5 w-3.5 flex-shrink-0" />
            List
          </button>
          <button
            onClick={() => setViewMode("grouped")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 text-[12px] rounded transition-colors",
              viewMode === "grouped"
                ? "bg-[#3E3E3E] text-[#EDEDED]"
                : "text-[#6B6B6B] hover:text-[#A1A1A1]"
            )}
          >
            <Layers className="h-3.5 w-3.5 flex-shrink-0" />
            By Deal
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 text-[12px] rounded transition-colors",
              viewMode === "kanban"
                ? "bg-[#3E3E3E] text-[#EDEDED]"
                : "text-[#6B6B6B] hover:text-[#A1A1A1]"
            )}
          >
            <Kanban className="h-3.5 w-3.5 flex-shrink-0" />
            Board
          </button>
        </div>
      </Toolbar>

      {/* Content based on view mode */}
      {viewMode === "list" ? (
        <>
          {/* Data Table */}
          <DataTable
            data={paginatedTasks}
            columns={columns}
            selectedIds={selectedIds}
            onSelectAll={toggleAll}
            onSelectRow={toggleRow}
            onRowDoubleClick={handleRowDoubleClick}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            getRowId={(task) => task.id}
            emptyMessage="No tasks yet. Tasks are created within deals."
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            totalRecords={tasks.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="flex-1 overflow-auto p-4">
          <TaskKanban />
        </div>
      ) : (
        /* Grouped View */
        <div className="flex-1 overflow-auto">
          {groupedTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[13px] text-[#6B6B6B]">
              No tasks yet. Tasks are created within deals.
            </div>
          ) : (
            <div className="divide-y divide-[#2A2A2A]">
              {groupedTasks.map((group) => (
                <div key={group.dealId} className="bg-[#1C1C1C]">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.dealId)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors"
                  >
                    {expandedGroups.has(group.dealId) ? (
                      <ChevronDown className="h-4 w-4 text-[#6B6B6B]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#6B6B6B]" />
                    )}
                    <Building2 className="h-4 w-4 text-[#60A5FA]" />
                    <span className="text-[14px] font-medium text-[#EDEDED]">
                      {group.deal?.name || "Unassigned Tasks"}
                    </span>
                    <span className="text-[12px] text-[#6B6B6B]">
                      {group.pendingCount} pending · {group.tasks.length} total
                    </span>
                    {group.deal && (
                      <Link
                        href={`/deals/${group.deal.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto text-[12px] text-[#60A5FA] hover:underline"
                      >
                        View Deal →
                      </Link>
                    )}
                  </button>

                  {/* Group Tasks */}
                  {expandedGroups.has(group.dealId) && (
                    <div className="bg-[#1C1C1C]/50">
                      {group.tasks.map((task) => {
                        const isCompleted = task.status === "completed";
                        const due = formatDueDate(task.due_date);

                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-4 px-4 py-2.5 pl-12 border-b border-[#2A2A2A]/50 hover:bg-[#2A2A2A]/50 transition-colors"
                          >
                            {/* Checkbox */}
                            <button
                              onClick={(e) => handleToggleComplete(e, task)}
                              className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                isCompleted
                                  ? "bg-[#3ECF8E] border-[#3ECF8E]"
                                  : "border-[#3E3E3E] hover:border-[#4E4E4E]"
                              )}
                            >
                              {isCompleted && <Check className="h-3 w-3 text-[#1C1C1C]" />}
                            </button>

                            {/* Task name */}
                            <span
                              className={cn(
                                "flex-1 text-[13px] truncate",
                                isCompleted
                                  ? "text-[#6B6B6B] line-through"
                                  : "text-[#EDEDED]"
                              )}
                            >
                              {task.task}
                            </span>

                            {/* Status */}
                            <StatusBadge status={task.status} statusMap={taskStatusMap} />

                            {/* Priority */}
                            <PriorityBadge priority={task.priority} />

                            {/* Due date */}
                            <span className={cn("text-[13px] w-20", due.className)}>
                              {due.text}
                            </span>

                            {/* Assignee */}
                            {task.assignee ? (
                              <div className="flex items-center gap-1.5 w-28">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-[10px] font-medium text-[#A78BFA]">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[12px] text-[#A1A1A1] truncate">
                                  {task.assignee.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[12px] text-[#6B6B6B] italic w-28">
                                Unassigned
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </TableLayout>
  );
}
