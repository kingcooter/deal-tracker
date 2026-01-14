"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Edit2,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SkeletonDealDetail } from "@/components/ui/skeleton";
import { useToastActions } from "@/components/ui/toast";
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
  getDeal,
  updateDeal,
  getDealWorkflows,
  getWorkflowTemplates,
  createDealWorkflow,
  deleteDealWorkflow,
  getTasksForWorkflow,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/supabase/queries";
import type { Deal, WorkflowTemplate } from "@/lib/supabase/types";

const propertyTypes = [
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail" },
  { value: "industrial", label: "Industrial" },
  { value: "multifamily", label: "Multifamily" },
  { value: "land", label: "Land" },
  { value: "mixed-use", label: "Mixed Use" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "closed", label: "Closed" },
];

interface WorkflowWithTasks {
  id: string;
  name: string;
  color: string;
  template_id: string;
  tasks: Task[];
}

const statusColors: Record<string, { badge: "success" | "warning" | "secondary"; label: string }> = {
  active: { badge: "success", label: "Active" },
  "on-hold": { badge: "warning", label: "On Hold" },
  closed: { badge: "secondary", label: "Closed" },
};

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const toast = useToastActions();

  const [deal, setDeal] = React.useState<Deal | null>(null);
  const [workflows, setWorkflows] = React.useState<WorkflowWithTasks[]>([]);
  const [templates, setTemplates] = React.useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedWorkflows, setExpandedWorkflows] = React.useState<Set<string>>(new Set());
  const [showAddWorkflow, setShowAddWorkflow] = React.useState(false);
  const [showEditDeal, setShowEditDeal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: "",
    status: "active" as "active" | "on-hold" | "closed",
    address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "office",
    notes: "",
  });

  // Fetch deal and workflows
  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch deal
        const dealData = await getDeal(dealId);
        setDeal(dealData);

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
        console.error("Error fetching deal:", error);
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

  const openEditDialog = () => {
    if (!deal) return;
    setEditForm({
      name: deal.name,
      status: deal.status,
      address: deal.address || "",
      city: deal.city || "",
      state: deal.state || "",
      zip: deal.zip || "",
      property_type: deal.property_type || "office",
      notes: deal.notes || "",
    });
    setShowEditDeal(true);
  };

  const handleUpdateDeal = async () => {
    if (!deal || !editForm.name) return;

    setSaving(true);
    try {
      const updated = await updateDeal(deal.id, {
        name: editForm.name,
        status: editForm.status,
        address: editForm.address || null,
        city: editForm.city || null,
        state: editForm.state || null,
        zip: editForm.zip || null,
        property_type: editForm.property_type || null,
        notes: editForm.notes || null,
      });

      setDeal(updated);
      setShowEditDeal(false);
      toast.success("Deal updated", `"${updated.name}" has been saved`);
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.error("Failed to update deal", "Please try again");
    } finally {
      setSaving(false);
    }
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
      // Map Task updates to database updates
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
    return <SkeletonDealDetail />;
  }

  if (!deal) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Deals", href: "/deals", icon: Building2 },
            { label: "Not Found" },
          ]}
        />
        <div className="text-center py-12">
          <p className="text-foreground-muted">Deal not found</p>
          <Link href="/deals" className="text-primary hover:underline mt-2 inline-block">
            Back to Deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Deals", href: "/deals", icon: Building2 },
          { label: deal.name },
        ]}
      />

      {/* Deal header */}
      <div className="flex gap-6">
        {/* Property image */}
        <div className="relative h-40 w-64 shrink-0 rounded-lg bg-surface overflow-hidden border border-border">
          {deal.image_url ? (
            <img
              src={deal.image_url}
              alt={deal.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-16 w-16 text-foreground-subtle" />
            </div>
          )}
        </div>

        {/* Deal info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {deal.name}
                </h1>
                <Badge variant={statusColors[deal.status]?.badge || "secondary"}>
                  {statusColors[deal.status]?.label || deal.status}
                </Badge>
              </div>
              {(deal.address || deal.city) && (
                <div className="mt-1 flex items-center gap-1 text-foreground-muted">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[deal.address, deal.city, deal.state, deal.zip].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openEditDialog}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Property details */}
          <div className="flex flex-wrap gap-4 text-sm">
            {deal.property_type && (
              <div className="flex items-center gap-2">
                <span className="text-foreground-muted">Type:</span>
                <Badge variant="secondary" className="capitalize">
                  {deal.property_type}
                </Badge>
              </div>
            )}
            {deal.sf && (
              <div>
                <span className="text-foreground-muted">Size:</span>{" "}
                <span className="text-foreground font-medium">
                  {Number(deal.sf).toLocaleString()} SF
                </span>
              </div>
            )}
            {deal.year_built && (
              <div>
                <span className="text-foreground-muted">Built:</span>{" "}
                <span className="text-foreground font-medium">
                  {deal.year_built}
                </span>
              </div>
            )}
          </div>

          {deal.notes && (
            <p className="text-sm text-foreground-muted">{deal.notes}</p>
          )}
        </div>
      </div>

      {/* Deal Progress Summary */}
      {workflows.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Overall Progress</h3>
            <span className="text-sm text-foreground-muted">
              {workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "completed").length, 0)} / {workflows.reduce((acc, w) => acc + w.tasks.length, 0)} tasks
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Progress */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <CheckCircle2 className="h-4 w-4 text-[#3ECF8E]" />
                <span>Completed</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "completed").length, 0)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Circle className="h-4 w-4 text-[#60A5FA]" />
                <span>In Progress</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "in_progress").length, 0)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <AlertCircle className="h-4 w-4 text-[#F87171]" />
                <span>Blocked</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "blocked").length, 0)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Circle className="h-4 w-4 text-[#6B6B6B]" />
                <span>To Do</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "not_started").length, 0)}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-[#2A2A2A] rounded-full overflow-hidden flex">
            {(() => {
              const total = workflows.reduce((acc, w) => acc + w.tasks.length, 0);
              if (total === 0) return null;
              const completed = workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "completed").length, 0);
              const inProgress = workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "in_progress").length, 0);
              const blocked = workflows.reduce((acc, w) => acc + w.tasks.filter((t) => t.status === "blocked").length, 0);
              return (
                <>
                  <div style={{ width: `${(completed / total) * 100}%` }} className="bg-[#3ECF8E] transition-all" />
                  <div style={{ width: `${(inProgress / total) * 100}%` }} className="bg-[#60A5FA] transition-all" />
                  <div style={{ width: `${(blocked / total) * 100}%` }} className="bg-[#F87171] transition-all" />
                </>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Workflows section */}
      <div className="space-y-4">
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
                  <div className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors">
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
      </div>

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

      {/* Edit Deal Dialog */}
      <Dialog open={showEditDeal} onOpenChange={setShowEditDeal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the deal details
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium text-foreground">
                Deal Name *
              </label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Deal name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium text-foreground">
                  Status
                </label>
                <Select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "active" | "on-hold" | "closed" })}
                >
                  {statusOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-property-type" className="text-sm font-medium text-foreground">
                  Property Type
                </label>
                <Select
                  id="edit-property-type"
                  value={editForm.property_type}
                  onChange={(e) => setEditForm({ ...editForm, property_type: e.target.value })}
                >
                  {propertyTypes.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-address" className="text-sm font-medium text-foreground">
                Address
              </label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label htmlFor="edit-city" className="text-sm font-medium text-foreground">
                  City
                </label>
                <Input
                  id="edit-city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-state" className="text-sm font-medium text-foreground">
                  State
                </label>
                <Input
                  id="edit-state"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  placeholder="TX"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-zip" className="text-sm font-medium text-foreground">
                  ZIP
                </label>
                <Input
                  id="edit-zip"
                  value={editForm.zip}
                  onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                  placeholder="ZIP"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <Input
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDeal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDeal} disabled={!editForm.name} loading={saving}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
