"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckSquare,
  Users,
  Plus,
  Edit2,
  Check,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeals, getAllTasks, getContacts } from "@/lib/supabase/queries";
import { formatDistanceToNow, parseISO } from "date-fns";

interface ActivityItem {
  id: string;
  type: "deal_created" | "task_completed" | "task_created" | "contact_created" | "deal_updated";
  title: string;
  subtitle?: string;
  timestamp: string;
  entityId: string;
  entityType: "deal" | "task" | "contact";
}

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivity() {
      try {
        const [deals, tasks, contacts] = await Promise.all([
          getDeals(),
          getAllTasks(),
          getContacts(),
        ]);

        const activityItems: ActivityItem[] = [];

        // Recent deals (created in last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        deals.forEach((deal) => {
          if (deal.created_at && new Date(deal.created_at) > weekAgo) {
            activityItems.push({
              id: `deal-${deal.id}`,
              type: "deal_created",
              title: `New deal created`,
              subtitle: deal.name,
              timestamp: deal.created_at,
              entityId: deal.id,
              entityType: "deal",
            });
          }
        });

        // Recent tasks (completed or created)
        tasks.forEach((task: { id: string; task: string; status: string; completed_at: string | null; created_at: string; workflow?: { deal?: { name: string; id: string } | null } | null }) => {
          if (task.status === "completed" && task.completed_at && new Date(task.completed_at) > weekAgo) {
            activityItems.push({
              id: `task-completed-${task.id}`,
              type: "task_completed",
              title: `Task completed`,
              subtitle: task.task,
              timestamp: task.completed_at,
              entityId: task.workflow?.deal?.id || task.id,
              entityType: "deal",
            });
          } else if (task.created_at && new Date(task.created_at) > weekAgo) {
            activityItems.push({
              id: `task-created-${task.id}`,
              type: "task_created",
              title: `Task added`,
              subtitle: task.task,
              timestamp: task.created_at,
              entityId: task.workflow?.deal?.id || task.id,
              entityType: "deal",
            });
          }
        });

        // Recent contacts
        contacts.forEach((contact) => {
          if (contact.created_at && new Date(contact.created_at) > weekAgo) {
            activityItems.push({
              id: `contact-${contact.id}`,
              type: "contact_created",
              title: `Contact added`,
              subtitle: contact.name,
              timestamp: contact.created_at,
              entityId: contact.id,
              entityType: "contact",
            });
          }
        });

        // Sort by timestamp descending
        activityItems.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(activityItems.slice(0, 10));
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, []);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "deal_created":
        return <Plus className="h-3.5 w-3.5" />;
      case "task_completed":
        return <Check className="h-3.5 w-3.5" />;
      case "task_created":
        return <CheckSquare className="h-3.5 w-3.5" />;
      case "contact_created":
        return <Users className="h-3.5 w-3.5" />;
      default:
        return <Edit2 className="h-3.5 w-3.5" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "deal_created":
        return "bg-[#3ECF8E]/20 text-[#3ECF8E]";
      case "task_completed":
        return "bg-[#3ECF8E]/20 text-[#3ECF8E]";
      case "task_created":
        return "bg-[#60A5FA]/20 text-[#60A5FA]";
      case "contact_created":
        return "bg-[#A78BFA]/20 text-[#A78BFA]";
      default:
        return "bg-[#FBBF24]/20 text-[#FBBF24]";
    }
  };

  const getEntityLink = (item: ActivityItem) => {
    switch (item.entityType) {
      case "deal":
        return `/deals/${item.entityId}`;
      case "contact":
        return `/contacts/${item.entityId}`;
      default:
        return "/tasks";
    }
  };

  if (loading) {
    return (
      <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A]">
        <div className="skeleton h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-12 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-[#FBBF24]" />
        <h3 className="text-[16px] font-medium text-[#EDEDED]">Recent Activity</h3>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 text-[#6B6B6B]" />
          <p className="text-[14px] text-[#A1A1A1]">No recent activity</p>
          <p className="text-[12px] text-[#6B6B6B] mt-1">
            Create deals and tasks to see activity
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((item) => (
            <Link
              key={item.id}
              href={getEntityLink(item)}
              className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-[#2A2A2A] transition-colors group"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  getActivityColor(item.type)
                )}
              >
                {getActivityIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#A1A1A1]">{item.title}</p>
                <p className="text-[13px] text-[#EDEDED] truncate">{item.subtitle}</p>
              </div>

              {/* Timestamp */}
              <span className="text-[11px] text-[#6B6B6B] flex-shrink-0">
                {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
