"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { TasksTable, type Task } from "@/components/tasks/tasks-table";
import {
  getDealWorkflows,
  getWorkflowTemplates,
  createDealWorkflow,
  deleteDealWorkflow,
  getTasksForWorkflow,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/supabase/queries";
import type { WorkflowTemplate } from "@/lib/supabase/types";

interface WorkflowWithTasks {
  id: string;
  name: string;
  color: string;
  template_id: string;
  tasks: Task[];
}

export default function DealProjectPage() {
  const params = useParams();
  const dealId = params.id as string;

  const [workflows, setWorkflows] = React.useState<WorkflowWithTasks[]>([]);
  const [templates, setTemplates] = React.useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedWorkflows, setExpandedWorkflows] = React.useState<Set<string>>(new Set());
  const [showAddWorkflow, setShowAddWorkflow] = React.useState(false);

  // Fetch workflows and templates
  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch workflow templates
        const templatesData = await getWorkflowTemplates();
        setTemplates(templatesData);

        // Fetch workflows for this deal
        const workflowsData = await getDealWorkflows(dealId);

        // Fetch tasks for each workflow
        const workflowsWithTasks: WorkflowWithTasks[] = await Promise.all(
          workflowsData.map(async (wf) => {
            const tasksData = await getTasksForWorkflow(wf.id);
            const template = wf.template as WorkflowTemplate;

            return {
              id: wf.id,
              name: wf.name || template?.name || "Workflow",
              color: template?.color || "#6b7280",
              template_id: wf.template_id,
              tasks: tasksData.map((t) => ({
                id: t.id,
                task: t.task,
                status: t.status as Task["status"],
                priority: t.priority as Task["priority"],
                owner: t.owner?.name || null,
                assignee: t.assignee?.name || null,
                opened_at: t.opened_at,
                due_date: t.due_date,
              })),
            };
          })
        );

        setWorkflows(workflowsWithTasks);
        // Expand all workflows by default
        setExpandedWorkflows(new Set(workflowsWithTasks.map((w) => w.id)));
      } catch (error) {
        console.error("Error fetching workflows:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dealId]);

  const toggleWorkflow = (id: string) => {
    setExpandedWorkflows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddWorkflow = async (templateId: string) => {
    try {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      const newWorkflow = await createDealWorkflow({
        deal_id: dealId,
        template_id: templateId,
        sort_order: workflows.length,
      });

      const workflowTemplate = newWorkflow.template as WorkflowTemplate;

      setWorkflows((prev) => [
        ...prev,
        {
          id: newWorkflow.id,
          name: workflowTemplate?.name || "Workflow",
          color: workflowTemplate?.color || "#6b7280",
          template_id: templateId,
          tasks: [],
        },
      ]);

      setExpandedWorkflows((prev) => new Set([...prev, newWorkflow.id]));
      setShowAddWorkflow(false);
    } catch (error) {
      console.error("Error adding workflow:", error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm("Delete this workflow and all its tasks?")) return;

    try {
      await deleteDealWorkflow(workflowId);
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch (error) {
      console.error("Error deleting workflow:", error);
    }
  };

  const handleTaskUpdate = async (workflowId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.task) dbUpdates.task = updates.task;

      await updateTask(taskId, dbUpdates);

      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          return {
            ...w,
            tasks: w.tasks.map((t) =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          };
        })
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskAdd = async (workflowId: string, task: Omit<Task, "id">) => {
    try {
      const newTask = await createTask({
        workflow_id: workflowId,
        task: task.task,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
      });

      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          return {
            ...w,
            tasks: [
              ...w.tasks,
              {
                id: newTask.id,
                task: newTask.task,
                status: newTask.status as Task["status"],
                priority: newTask.priority as Task["priority"],
                owner: newTask.owner?.name || null,
                assignee: newTask.assignee?.name || null,
                opened_at: newTask.opened_at,
                due_date: newTask.due_date,
              },
            ],
          };
        })
      );
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleTaskDelete = async (workflowId: string, taskId: string) => {
    try {
      await deleteTask(taskId);
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          return {
            ...w,
            tasks: w.tasks.filter((t) => t.id !== taskId),
          };
        })
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Get templates not yet added to this deal
  const availableTemplates = templates.filter(
    (t) => !workflows.some((w) => w.template_id === t.id)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-surface-elevated animate-pulse rounded" />
          <div className="h-9 w-32 bg-surface-elevated animate-pulse rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-6 w-48 bg-surface-elevated animate-pulse rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Workflows</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddWorkflow(true)}
          disabled={availableTemplates.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Workflow
        </Button>
      </div>

      {/* Workflow accordions */}
      {workflows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-foreground-muted">
            No workflows yet. Add a workflow to start tracking tasks.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowAddWorkflow(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Workflow
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => {
            const isExpanded = expandedWorkflows.has(workflow.id);
            const completedTasks = workflow.tasks.filter(
              (t) => t.status === "completed"
            ).length;
            const totalTasks = workflow.tasks.length;

            return (
              <Card key={workflow.id} className="overflow-hidden">
                {/* Workflow header */}
                <div className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors group">
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: workflow.color }}
                    />
                    <span className="font-medium text-foreground">
                      {workflow.name}
                    </span>
                    <span className="text-sm text-foreground-muted">
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    {/* Mini progress bar */}
                    {totalTasks > 0 && (
                      <div className="h-1.5 w-20 bg-surface-hover rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: workflow.color,
                            width: `${(completedTasks / totalTasks) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="rounded-md p-1 hover:bg-error-muted hover:text-error transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleWorkflow(workflow.id)}>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-foreground-muted" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-foreground-muted" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tasks table */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <TasksTable
                      tasks={workflow.tasks}
                      workflowId={workflow.id}
                      onTaskUpdate={(taskId, updates) =>
                        handleTaskUpdate(workflow.id, taskId, updates)
                      }
                      onTaskAdd={(task) => handleTaskAdd(workflow.id, task)}
                      onTaskDelete={(taskId) =>
                        handleTaskDelete(workflow.id, taskId)
                      }
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Workflow Dialog */}
      <Dialog open={showAddWorkflow} onOpenChange={setShowAddWorkflow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workflow</DialogTitle>
            <DialogDescription>
              Select a workflow template to add to this deal
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-2">
            {availableTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddWorkflow(template.id)}
                className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: template.color || "#6b7280" }}
                />
                <span className="font-medium text-foreground">
                  {template.name}
                </span>
              </button>
            ))}

            {availableTemplates.length === 0 && (
              <p className="text-center text-foreground-muted py-4">
                All workflow templates have been added to this deal.
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWorkflow(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
