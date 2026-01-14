"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  CheckSquare,
  DollarSign,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { getDeals, getContacts, getAllTasks } from "@/lib/supabase/queries";
import { MyTasksToday } from "@/components/dashboard/my-tasks-today";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickAddTask, useQuickAddTask } from "@/components/quick-add-task";
import { useCommandPalette } from "@/components/command-palette";

interface DashboardStats {
  totalDeals: number;
  activeDeals: number;
  totalContacts: number;
  totalTasks: number;
  openTasks: number;
  tasksDueSoon: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState("Last 7 days");
  const { isOpen: quickAddTaskOpen, setIsOpen: setQuickAddTaskOpen } = useQuickAddTask();
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const [deals, contacts, tasks] = await Promise.all([
          getDeals(),
          getContacts(),
          getAllTasks(),
        ]);

        // Count tasks due within 7 days
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const tasksDueSoon = tasks.filter((task) => {
          if (!task.due_date || task.status === "completed") return false;
          const dueDate = new Date(task.due_date);
          return dueDate <= weekFromNow;
        }).length;

        const openTasks = tasks.filter(
          (task) => task.status !== "completed"
        ).length;

        setStats({
          totalDeals: deals.length,
          activeDeals: deals.filter((d) => d.status === "active").length,
          totalContacts: contacts.length,
          totalTasks: tasks.length,
          openTasks,
          tasksDueSoon,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="skeleton h-10 w-48" />
          <div className="flex gap-4">
            <div className="skeleton h-16 w-24" />
            <div className="skeleton h-16 w-24" />
            <div className="skeleton h-16 w-24" />
          </div>
        </div>
        <div className="skeleton h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-44 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#A1A1A1]">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        {/* Title */}
        <h1 className="text-[32px] font-semibold text-[#EDEDED]">
          Deal Tracker
        </h1>

        {/* Stats on right */}
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[12px] text-[#A1A1A1]">Deals</p>
            <p className="text-[24px] font-semibold text-[#EDEDED]">
              {stats.totalDeals}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#A1A1A1]">Tasks</p>
            <p className="text-[24px] font-semibold text-[#EDEDED]">
              {stats.totalTasks}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#A1A1A1]">Contacts</p>
            <p className="text-[24px] font-semibold text-[#EDEDED]">
              {stats.totalContacts}
            </p>
          </div>
          {/* Active status badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A2A2A]">
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E]" />
            <span className="text-[13px] text-[#EDEDED]">Active</span>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded-md hover:border-[#4E4E4E] transition-colors">
          {timeRange}
          <ChevronDown className="h-4 w-4 text-[#6B6B6B]" />
        </button>
        <span className="text-[13px] text-[#6B6B6B]">
          Activity for last 7 days
        </span>
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Deals Card */}
        <MetricCard
          icon={<Building2 className="h-5 w-5" />}
          title="Deals"
          label="Active Deals"
          value={stats.activeDeals}
          chartData={generateChartData(stats.activeDeals)}
        />

        {/* Open Tasks Card */}
        <MetricCard
          icon={<CheckSquare className="h-5 w-5" />}
          title="Tasks"
          label="Open Tasks"
          value={stats.openTasks}
          chartData={generateChartData(stats.openTasks)}
        />

        {/* Pipeline Value Card */}
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          title="Pipeline"
          label="Total Value"
          value="$4.2M"
          isString
          chartData={generateChartData(42)}
        />

        {/* Tasks Due Soon Card */}
        <MetricCard
          icon={<Calendar className="h-5 w-5" />}
          title="Due Soon"
          label="Tasks Due"
          value={stats.tasksDueSoon}
          subtitle="This week"
          chartData={generateChartData(stats.tasksDueSoon)}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        {/* Left Column - Tasks & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks Today */}
          <MyTasksToday />

          {/* Recent Deals */}
          <div>
            <h2 className="text-[16px] font-semibold text-[#EDEDED] mb-4">
              Recent Deals
            </h2>
            <RecentDealsTable />
          </div>
        </div>

        {/* Right Column - Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions
            onNewDeal={() => router.push("/deals?new=true")}
            onNewTask={() => setQuickAddTaskOpen(true)}
            onNewContact={() => router.push("/contacts?new=true")}
            onSearch={() => setCommandPaletteOpen(true)}
          />

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>

      {/* Quick Add Task Modal */}
      <QuickAddTask open={quickAddTaskOpen} onOpenChange={setQuickAddTaskOpen} />
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  label: string;
  value: number | string;
  isString?: boolean;
  subtitle?: string;
  chartData: number[];
}

function MetricCard({
  icon,
  title,
  label,
  value,
  subtitle,
  chartData,
}: MetricCardProps) {
  const maxValue = Math.max(...chartData, 1);

  return (
    <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3E3E3E] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#EDEDED]">{icon}</span>
        <span className="text-[16px] font-medium text-[#EDEDED]">{title}</span>
      </div>

      {/* Label */}
      <p className="text-[13px] text-[#A1A1A1] mb-1">{label}</p>

      {/* Value */}
      <p className="text-[28px] font-semibold text-[#EDEDED] mb-4">{value}</p>

      {/* Bar Chart */}
      <div className="h-20 flex items-end gap-1">
        {chartData.map((val, i) => (
          <div
            key={i}
            className="flex-1 bg-[#3ECF8E] rounded-t"
            style={{
              height: `${(val / maxValue) * 100}%`,
              minHeight: val > 0 ? "4px" : "0px",
              opacity: 0.8 + (i / chartData.length) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Chart labels */}
      <div className="flex justify-between mt-2">
        <span className="text-[11px] text-[#6B6B6B]">
          {subtitle || "Jan 8"}
        </span>
        <span className="text-[11px] text-[#6B6B6B]">
          {subtitle ? "" : "Jan 14"}
        </span>
      </div>
    </div>
  );
}

function generateChartData(baseValue: number): number[] {
  // Generate 7 days of fake data trending toward the current value
  const data: number[] = [];
  for (let i = 0; i < 7; i++) {
    const variance = Math.random() * 0.3 - 0.15; // -15% to +15%
    const trend = i / 6; // Trend toward final value
    const val = Math.max(
      0,
      Math.round(baseValue * (0.7 + trend * 0.3 + variance))
    );
    data.push(val);
  }
  // Ensure last value is close to actual
  data[6] = baseValue;
  return data;
}

function RecentDealsTable() {
  const [deals, setDeals] = React.useState<
    Array<{
      id: string;
      name: string;
      status: string;
      city: string | null;
      state: string | null;
    }>
  >([]);

  React.useEffect(() => {
    getDeals().then((data) => setDeals(data.slice(0, 5)));
  }, []);

  if (deals.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg bg-[#1C1C1C] border border-[#2A2A2A]">
        <Building2 className="h-8 w-8 mx-auto mb-2 text-[#6B6B6B]" />
        <p className="text-[#A1A1A1]">No deals yet</p>
        <Link
          href="/deals"
          className="inline-block mt-3 px-4 py-2 text-[13px] text-[#1C1C1C] bg-[#3ECF8E] rounded-md hover:bg-[#4AE39A] transition-colors"
        >
          Create your first deal
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-[#2A2A2A]">
        <span className="text-[12px] font-medium text-[#A1A1A1] uppercase tracking-wider">
          Name
        </span>
        <span className="text-[12px] font-medium text-[#A1A1A1] uppercase tracking-wider">
          Location
        </span>
        <span className="text-[12px] font-medium text-[#A1A1A1] uppercase tracking-wider">
          Status
        </span>
      </div>

      {/* Table Rows */}
      {deals.map((deal) => (
        <Link
          key={deal.id}
          href={`/deals/${deal.id}`}
          className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-[#2A2A2A] last:border-b-0 hover:bg-[#2A2A2A] transition-colors"
        >
          <span className="text-[13px] text-[#EDEDED] truncate">
            {deal.name}
          </span>
          <span className="text-[13px] text-[#A1A1A1] truncate">
            {[deal.city, deal.state].filter(Boolean).join(", ") || "—"}
          </span>
          <span>
            <StatusBadge status={deal.status} />
          </span>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    active: {
      bg: "rgba(251, 191, 36, 0.15)",
      text: "#FBBF24",
      label: "Under Contract",
    },
    closed: {
      bg: "rgba(62, 207, 142, 0.2)",
      text: "#3ECF8E",
      label: "Closed Won",
    },
    "on-hold": {
      bg: "rgba(248, 113, 113, 0.15)",
      text: "#F87171",
      label: "On Hold",
    },
  };

  const style = statusStyles[status] || statusStyles.active;

  return (
    <span
      className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}
