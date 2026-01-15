"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock, AlertTriangle, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllTasks, updateTask } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";
import { isToday, isPast, parseISO } from "date-fns";

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

export function MyTasksToday() {
  const toast = useToastActions();
  const [tasks, setTasks] = React.useState<TaskWithDeal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTasks() {
      try {
        const allTasks = await getAllTasks();
        // Filter to today's tasks and overdue tasks
        const todayTasks = (allTasks as TaskWithDeal[]).filter((task) => {
          if (task.status === "completed") return false;
          if (!task.due_date) return false;
          const dueDate = parseISO(task.due_date);
          return isToday(dueDate) || isPast(dueDate);
        });
        // Sort by priority (urgent > high > medium > low) then by due date
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        todayTasks.sort((a, b) => {
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
          if (aPriority !== bPriority) return aPriority - bPriority;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        setTasks(todayTasks.slice(0, 5));
      } catch {
        // Silently fail - tasks will just show empty
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleComplete = async (task: TaskWithDeal) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      await updateTask(task.id, { status: "completed" });
      toast.success("Task completed", task.task);
    } catch {
      // Rollback
      setTasks((prev) => [...prev, task]);
      toast.error("Failed to complete task", "Please try again");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-[#EF4444] bg-[#EF4444]/10";
      case "high":
        return "text-[#F87171] bg-[#F87171]/10";
      case "medium":
        return "text-[#FBBF24] bg-[#FBBF24]/10";
      default:
        return "text-[#3ECF8E] bg-[#3ECF8E]/10";
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return isPast(parseISO(dueDate)) && !isToday(parseISO(dueDate));
  };

  if (loading) {
    return (
      <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-5 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#60A5FA]" />
          <h3 className="text-[16px] font-medium text-[#EDEDED]">My Tasks Today</h3>
        </div>
        <Link
          href="/tasks"
          className="flex items-center gap-1 text-[12px] text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <Check className="h-8 w-8 mx-auto mb-2 text-[#3ECF8E]" />
          <p className="text-[14px] text-[#A1A1A1]">All caught up!</p>
          <p className="text-[12px] text-[#6B6B6B] mt-1">No tasks due today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-md bg-[#2A2A2A]/50 hover:bg-[#2A2A2A] transition-colors group"
            >
              {/* Complete button */}
              <button
                onClick={() => handleComplete(task)}
                className="w-5 h-5 rounded border border-[#3E3E3E] hover:border-[#3ECF8E] hover:bg-[#3ECF8E]/10 transition-colors flex-shrink-0"
              />

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#EDEDED] truncate">{task.task}</p>
                {task.workflow?.deal && (
                  <Link
                    href={`/deals/${task.workflow.deal.id}`}
                    className="flex items-center gap-1 text-[11px] text-[#6B6B6B] hover:text-[#60A5FA] transition-colors"
                  >
                    <Building2 className="h-3 w-3" />
                    {task.workflow.deal.name}
                  </Link>
                )}
              </div>

              {/* Priority badge */}
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded capitalize flex-shrink-0",
                  getPriorityColor(task.priority)
                )}
              >
                {task.priority}
              </span>

              {/* Overdue indicator */}
              {isOverdue(task.due_date) && (
                <div className="flex items-center gap-1 text-[#F87171]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Overdue</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#2A2A2A]">
          <p className="text-[12px] text-[#6B6B6B]">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} need attention
          </p>
        </div>
      )}
    </div>
  );
}
