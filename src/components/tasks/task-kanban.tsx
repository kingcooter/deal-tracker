"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  GripVertical,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllTasks, updateTask } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";
import { format, isPast, isToday, parseISO } from "date-fns";

interface TaskWithDeal {
  id: string;
  task: string;
  status: string;
  priority: string;
  due_date: string | null;
  workflow: {
    deal: { id: string; name: string } | null;
  } | null;
}

interface Column {
  id: string;
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: "not_started", title: "To Do", color: "#6B6B6B" },
  { id: "in_progress", title: "In Progress", color: "#60A5FA" },
  { id: "blocked", title: "Blocked", color: "#F87171" },
  { id: "completed", title: "Done", color: "#3ECF8E" },
];

export function TaskKanban() {
  const toast = useToastActions();
  const [tasks, setTasks] = React.useState<TaskWithDeal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draggingTask, setDraggingTask] = React.useState<TaskWithDeal | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAllTasks()
      .then((data) => setTasks(data as TaskWithDeal[]))
      .catch(() => {
        console.error("Error fetching tasks:", "Please refresh the page");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        if (aPriority !== bPriority) return aPriority - bPriority;
        // Then by due date
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
  };

  const handleDragStart = (e: React.DragEvent, task: TaskWithDeal) => {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggingTask || draggingTask.status === columnId) {
      setDraggingTask(null);
      return;
    }

    const oldStatus = draggingTask.status;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggingTask.id ? { ...t, status: columnId } : t
      )
    );

    try {
      await updateTask(draggingTask.id, { status: columnId as "not_started" | "in_progress" | "blocked" | "completed" });
      const column = columns.find((c) => c.id === columnId);
      toast.success("Task moved", `→ ${column?.title}`);
    } catch {
      // Rollback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === draggingTask.id ? { ...t, status: oldStatus } : t
        )
      );
      toast.error("Failed to move task", "Please try again");
    }

    setDraggingTask(null);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex gap-4 h-full">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[250px]">
            <div className="skeleton h-8 rounded-md mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-20 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-[280px] flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3 px-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="text-[13px] font-medium text-[#EDEDED]">
                {column.title}
              </h3>
              <span className="text-[11px] text-[#6B6B6B] bg-[#2A2A2A] px-1.5 py-0.5 rounded">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div
              className={cn(
                "flex-1 p-2 rounded-lg transition-colors min-h-[200px]",
                isOver
                  ? "bg-[#60A5FA]/10 border-2 border-dashed border-[#60A5FA]/30"
                  : "bg-[#1C1C1C]/50"
              )}
            >
              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggingTask?.id === task.id}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {columnTasks.length === 0 && !isOver && (
                  <div className="py-8 text-center">
                    <p className="text-[12px] text-[#6B6B6B]">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface TaskCardProps {
  task: TaskWithDeal;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function TaskCard({ task, isDragging, onDragStart, onDragEnd }: TaskCardProps) {
  const isOverdue =
    task.due_date &&
    isPast(parseISO(task.due_date)) &&
    !isToday(parseISO(task.due_date)) &&
    task.status !== "completed";

  const isDueToday = task.due_date && isToday(parseISO(task.due_date));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#EF4444";
      case "high":
        return "#F87171";
      case "medium":
        return "#FBBF24";
      default:
        return "#3ECF8E";
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "p-3 rounded-lg bg-[#2A2A2A] border border-[#3E3E3E] hover:border-[#4E4E4E] transition-all cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50 scale-95",
        isOverdue && "border-l-2 border-l-[#F87171]"
      )}
    >
      {/* Task Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={cn(
            "text-[13px] text-[#EDEDED]",
            task.status === "completed" && "line-through text-[#6B6B6B]"
          )}
        >
          {task.task}
        </span>
        <GripVertical className="h-4 w-4 text-[#6B6B6B] opacity-0 group-hover:opacity-100 flex-shrink-0" />
      </div>

      {/* Deal Link */}
      {task.workflow?.deal && (
        <Link
          href={`/deals/${task.workflow.deal.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] hover:text-[#60A5FA] transition-colors mb-2"
        >
          <Building2 className="h-3 w-3" />
          <span className="truncate">{task.workflow.deal.name}</span>
        </Link>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        <div className="flex items-center gap-1.5">
          {task.due_date && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px]",
                isOverdue
                  ? "text-[#F87171]"
                  : isDueToday
                    ? "text-[#FBBF24]"
                    : "text-[#6B6B6B]"
              )}
            >
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>
                {isDueToday
                  ? "Today"
                  : format(parseISO(task.due_date), "MMM d")}
              </span>
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="flex items-center gap-1">
          <Flag
            className="h-3 w-3"
            style={{ color: getPriorityColor(task.priority) }}
          />
        </div>
      </div>
    </div>
  );
}
