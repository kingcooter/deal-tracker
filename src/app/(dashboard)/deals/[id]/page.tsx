"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Calendar,
  Ruler,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
  FolderKanban,
  Users,
  FileText,
  Settings,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DealNotes } from "@/components/deals";
import { getDeal, getDealWorkflows, getTasksForWorkflow, updateDeal } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

const propertyTypeLabels: Record<string, string> = {
  office: "Office",
  retail: "Retail",
  industrial: "Industrial",
  multifamily: "Multifamily",
  land: "Land",
  "mixed-use": "Mixed Use",
};

const statusConfig: Record<string, { badge: "success" | "warning" | "secondary"; label: string }> = {
  active: { badge: "success", label: "Under Contract" },
  "on-hold": { badge: "warning", label: "On Hold" },
  closed: { badge: "secondary", label: "Closed Won" },
};

export default function DealOverviewPage() {
  const params = useParams();
  const dealId = params.id as string;
  const queryClient = useQueryClient();
  const toast = useToastActions();

  // Inline editing state
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch deal data
  const { data: deal } = useQuery<Deal>({
    queryKey: ["deal", dealId],
    queryFn: () => getDeal(dealId),
    staleTime: 60 * 1000,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Deal>) => updateDeal(dealId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: () => {
      toast.error("Update failed", "Could not save changes");
    },
  });

  // Handle name save
  const handleNameSave = () => {
    if (!editedName.trim()) {
      setIsEditingName(false);
      return;
    }
    updateMutation.mutate({ name: editedName.trim() });
    toast.success("Updated", "Deal name saved");
    setIsEditingName(false);
  };

  // Handle status change
  const handleStatusChange = (newStatus: "active" | "closed" | "on-hold") => {
    updateMutation.mutate({ status: newStatus });
    const labels = { active: "Active", closed: "Closed Won", "on-hold": "On Hold" };
    toast.success("Status updated", `Deal marked as ${labels[newStatus]}`);
    setShowStatusDropdown(false);
  };

  // Focus name input when editing starts
  React.useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Close status dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch task summary for progress
  const { data: taskSummary } = useQuery({
    queryKey: ["deal-task-summary", dealId],
    queryFn: async () => {
      const workflows = await getDealWorkflows(dealId);
      let completed = 0;
      let inProgress = 0;
      let blocked = 0;
      let notStarted = 0;

      for (const workflow of workflows) {
        const tasks = await getTasksForWorkflow(workflow.id);
        for (const task of tasks) {
          if (task.status === "completed") completed++;
          else if (task.status === "in_progress") inProgress++;
          else if (task.status === "blocked") blocked++;
          else notStarted++;
        }
      }

      return {
        completed,
        inProgress,
        blocked,
        notStarted,
        total: completed + inProgress + blocked + notStarted,
        workflowCount: workflows.length,
      };
    },
    staleTime: 30 * 1000,
  });

  if (!deal) {
    return null; // Layout handles loading/not found
  }

  const location = [deal.city, deal.state].filter(Boolean).join(", ");
  const fullAddress = [deal.address, deal.city, deal.state, deal.zip].filter(Boolean).join(", ");
  const createdDate = new Date(deal.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const statusInfo = statusConfig[deal.status] || statusConfig.active;

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {/* Inline Name Editing */}
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="text-2xl font-semibold text-foreground bg-transparent border-b-2 border-primary outline-none px-1 py-0"
                />
                <button
                  onClick={handleNameSave}
                  className="p-1 rounded hover:bg-surface-hover text-success"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-1 rounded hover:bg-surface-hover text-foreground-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <h1
                onClick={() => {
                  setEditedName(deal.name);
                  setIsEditingName(true);
                }}
                className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors group flex items-center gap-2"
              >
                {deal.name}
                <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h1>
            )}

            {/* Inline Status Selector */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="focus:outline-none"
              >
                <Badge
                  variant={statusInfo.badge}
                  className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex items-center gap-1"
                >
                  {statusInfo.label}
                  <ChevronDown className={cn(
                    "h-3 w-3 transition-transform",
                    showStatusDropdown && "rotate-180"
                  )} />
                </Badge>
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-2 z-50 min-w-[150px] bg-surface-elevated border border-border rounded-lg shadow-lg overflow-hidden">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as "active" | "closed" | "on-hold")}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm text-left transition-colors",
                        deal.status === status ? "bg-surface-active" : "hover:bg-surface-hover"
                      )}
                    >
                      <span className="text-foreground">{config.label}</span>
                      {deal.status === status && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
              <MapPin className="h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          )}
        </div>
        <Link href={`/deals/${dealId}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Deal Info Card */}
      <Card className="p-6">
        <div className="flex gap-6">
          {/* Property Image */}
          <div className="relative h-32 w-48 shrink-0 rounded-lg bg-surface overflow-hidden border border-border">
            {deal.image_url ? (
              <Image
                src={deal.image_url}
                alt={deal.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Building2 className="h-12 w-12 text-foreground-subtle" />
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {deal.property_type && (
                <div>
                  <span className="text-foreground-muted block mb-1">Property Type</span>
                  <Badge variant="secondary" className="capitalize">
                    {propertyTypeLabels[deal.property_type] || deal.property_type}
                  </Badge>
                </div>
              )}
              {deal.sf && (
                <div>
                  <span className="text-foreground-muted block mb-1">Size</span>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Ruler className="h-4 w-4" />
                    {Number(deal.sf).toLocaleString()} SF
                  </div>
                </div>
              )}
              {deal.year_built && (
                <div>
                  <span className="text-foreground-muted block mb-1">Year Built</span>
                  <span className="text-foreground font-medium">{deal.year_built}</span>
                </div>
              )}
              <div>
                <span className="text-foreground-muted block mb-1">Created</span>
                <div className="flex items-center gap-1 text-foreground font-medium">
                  <Calendar className="h-4 w-4" />
                  {createdDate}
                </div>
              </div>
            </div>

            {fullAddress && (
              <div className="flex items-start gap-2 text-sm text-foreground-muted">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{fullAddress}</span>
              </div>
            )}

            {deal.notes && (
              <p className="text-sm text-foreground-muted">{deal.notes}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Summary */}
      {taskSummary && taskSummary.total > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Project Progress</h3>
            <span className="text-sm text-foreground-muted">
              {taskSummary.completed} / {taskSummary.total} tasks completed
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <CheckCircle2 className="h-4 w-4 text-[#3ECF8E]" />
                <span>Completed</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {taskSummary.completed}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Circle className="h-4 w-4 text-[#60A5FA]" />
                <span>In Progress</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {taskSummary.inProgress}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <AlertCircle className="h-4 w-4 text-[#F87171]" />
                <span>Blocked</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {taskSummary.blocked}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Circle className="h-4 w-4 text-[#6B6B6B]" />
                <span>To Do</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {taskSummary.notStarted}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden flex">
            {taskSummary.total > 0 && (
              <>
                <div
                  style={{ width: `${(taskSummary.completed / taskSummary.total) * 100}%` }}
                  className="bg-[#3ECF8E] transition-all"
                />
                <div
                  style={{ width: `${(taskSummary.inProgress / taskSummary.total) * 100}%` }}
                  className="bg-[#60A5FA] transition-all"
                />
                <div
                  style={{ width: `${(taskSummary.blocked / taskSummary.total) * 100}%` }}
                  className="bg-[#F87171] transition-all"
                />
              </>
            )}
          </div>

          {/* Link to Project tab */}
          <div className="mt-4 pt-4 border-t border-border">
            <Link href={`/deals/${dealId}/project`}>
              <Button variant="outline" size="sm">
                <FolderKanban className="h-4 w-4 mr-2" />
                View All Tasks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/deals/${dealId}/project`}>
          <Card className="p-4 hover:bg-surface-hover transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-elevated">
                <FolderKanban className="h-5 w-5 text-foreground-muted" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Project</h4>
                <p className="text-xs text-foreground-muted">
                  {taskSummary?.workflowCount ?? 0} workflows, {taskSummary?.total ?? 0} tasks
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href={`/deals/${dealId}/people`}>
          <Card className="p-4 hover:bg-surface-hover transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-elevated">
                <Users className="h-5 w-5 text-foreground-muted" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">People</h4>
                <p className="text-xs text-foreground-muted">Manage deal contacts</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href={`/deals/${dealId}/resources`}>
          <Card className="p-4 hover:bg-surface-hover transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-elevated">
                <FileText className="h-5 w-5 text-foreground-muted" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Resources</h4>
                <p className="text-xs text-foreground-muted">Documents & artifacts</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Notes Section */}
      <DealNotes dealId={dealId} />
    </div>
  );
}
