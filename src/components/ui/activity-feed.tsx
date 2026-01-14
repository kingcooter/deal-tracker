"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ActivityEntry,
  ActivityType,
  formatRelativeTime,
} from "@/lib/hooks/use-activity";

interface ActivityFeedProps {
  entries: ActivityEntry[];
  maxEntries?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onClear?: () => void;
  className?: string;
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  deal_created: Plus,
  deal_updated: Edit3,
  deal_deleted: Trash2,
  deal_status_changed: RefreshCw,
  contact_created: Plus,
  contact_updated: Edit3,
  contact_deleted: Trash2,
  task_created: Plus,
  task_completed: CheckCircle2,
  task_updated: Edit3,
  workflow_added: Plus,
  note_added: Edit3,
};

// Updated to use entity colors
const activityColors: Record<ActivityType, string> = {
  deal_created: "bg-entity-deal-muted text-entity-deal",
  deal_updated: "bg-entity-deal-muted text-entity-deal",
  deal_deleted: "bg-error-muted text-error",
  deal_status_changed: "bg-warning-muted text-warning",
  contact_created: "bg-entity-contact-muted text-entity-contact",
  contact_updated: "bg-entity-contact-muted text-entity-contact",
  contact_deleted: "bg-error-muted text-error",
  task_created: "bg-entity-task-muted text-entity-task",
  task_completed: "bg-success-muted text-success",
  task_updated: "bg-entity-task-muted text-entity-task",
  workflow_added: "bg-entity-workflow-muted text-entity-workflow",
  note_added: "bg-info-muted text-info",
};

const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  deal: Building2,
  contact: Users,
  task: CheckCircle2,
  workflow: Building2,
};

export function ActivityFeed({
  entries,
  maxEntries = 10,
  showViewAll = true,
  onViewAll,
  onClear,
  className,
}: ActivityFeedProps) {
  const displayedEntries = entries.slice(0, maxEntries);

  if (entries.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <Clock className="h-8 w-8 flex-shrink-0 text-foreground-subtle mb-2" />
        <p className="text-sm text-foreground-muted">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {displayedEntries.map((entry) => (
          <ActivityItem key={entry.id} entry={entry} />
        ))}
      </div>

      {(showViewAll || onClear) && entries.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear all
            </Button>
          )}
          {showViewAll && entries.length > maxEntries && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              <span>View all ({entries.length})</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface ActivityItemProps {
  entry: ActivityEntry;
  className?: string;
}

export function ActivityItem({ entry, className }: ActivityItemProps) {
  const Icon = activityIcons[entry.type] || Edit3;
  const EntityIcon = entityIcons[entry.entityType] || Building2;
  const colorClass = activityColors[entry.type] || "bg-surface-hover text-foreground-muted";

  const getEntityLink = () => {
    switch (entry.entityType) {
      case "deal":
        return `/deals/${entry.entityId}`;
      case "contact":
        return `/contacts`;
      default:
        return null;
    }
  };

  const link = getEntityLink();
  const isDeleted = entry.type.includes("deleted");

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        !isDeleted && link && "hover:bg-surface-hover cursor-pointer",
        className
      )}
    >
      <div className={cn("p-2 rounded-md flex-shrink-0", colorClass)}>
        <Icon className="h-4 w-4 flex-shrink-0" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">{entry.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <EntityIcon className="h-3 w-3 flex-shrink-0 text-foreground-subtle" />
          <span className="text-xs text-foreground-muted">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );

  if (link && !isDeleted) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

// Compact activity list for sidebars
interface ActivityListCompactProps {
  entries: ActivityEntry[];
  maxEntries?: number;
  className?: string;
}

export function ActivityListCompact({
  entries,
  maxEntries = 5,
  className,
}: ActivityListCompactProps) {
  const displayedEntries = entries.slice(0, maxEntries);

  return (
    <div className={cn("space-y-2", className)}>
      {displayedEntries.map((entry) => {
        const Icon = activityIcons[entry.type] || Edit3;
        return (
          <div key={entry.id} className="flex items-center gap-2 text-sm">
            <Icon className="h-3 w-3 flex-shrink-0 text-foreground-subtle" />
            <span className="truncate text-foreground-muted flex-1 min-w-0" title={entry.description}>
              {entry.entityName}
            </span>
            <span className="text-xs text-foreground-subtle flex-shrink-0">
              {formatRelativeTime(entry.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
