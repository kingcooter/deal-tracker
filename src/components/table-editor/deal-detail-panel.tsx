"use client";

import * as React from "react";
import { Check, AlertTriangle, Circle, Mail, Phone } from "lucide-react";
import { SlideOver, SlideOverField, SlideOverSection, SlideOverDivider } from "./slide-over";
import { InlineSelectEdit } from "./inline-edit";
import { StatusBadge } from "./data-table";
import { getDealContacts, getTasksForDeal, updateDeal, updateTask } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";
import type { Deal } from "@/lib/supabase/types";

// Status mapping for PM vocabulary
const dealStatusMap: Record<string, { bg: string; text: string; label: string }> = {
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

const statusOptions = [
  { value: "active", label: "Under Contract", bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  { value: "closed", label: "Closed Won", bg: "rgba(62, 207, 142, 0.2)", text: "#3ECF8E" },
  { value: "on-hold", label: "On Hold", bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
];

const propertyTypeOptions = [
  { value: "office", label: "Office", bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA" },
  { value: "retail", label: "Retail", bg: "rgba(236, 72, 153, 0.15)", text: "#EC4899" },
  { value: "industrial", label: "Industrial", bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  { value: "multifamily", label: "Multifamily", bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E" },
  { value: "land", label: "Land", bg: "rgba(120, 113, 108, 0.15)", text: "#78716C" },
  { value: "mixed-use", label: "Mixed Use", bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6" },
];

interface Task {
  id: string;
  task: string;
  status: string;
  priority: string;
}

interface DealContact {
  contact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
  };
  relationship: string | null;
}

interface DealDetailPanelProps {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onDealUpdate: (deal: Deal) => void;
}

export function DealDetailPanel({ deal, open, onClose, onDealUpdate }: DealDetailPanelProps) {
  const toast = useToastActions();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [contacts, setContacts] = React.useState<DealContact[]>([]);
  const [loadingTasks, setLoadingTasks] = React.useState(false);
  const [loadingContacts, setLoadingContacts] = React.useState(false);
  const [editingField, setEditingField] = React.useState<string | null>(null);

  // Fetch tasks and contacts when deal changes
  React.useEffect(() => {
    if (!deal) return;

    const dealId = deal.id;

    async function fetchData() {
      setLoadingTasks(true);
      setLoadingContacts(true);

      Promise.all([
        getTasksForDeal(dealId),
        getDealContacts(dealId),
      ])
        .then(([tasksData, contactsData]) => {
          setTasks(tasksData as Task[]);
          setContacts(contactsData as DealContact[]);
        })
        .catch(() => {
          toast.error("Failed to load activities");
        })
        .finally(() => {
          setLoadingTasks(false);
          setLoadingContacts(false);
        });
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only re-fetch when deal.id changes, not entire deal object
  }, [deal?.id, toast]);

  // Handle field update
  const handleFieldUpdate = async (field: string, value: string) => {
    if (!deal) return;

    const previousValue = deal[field as keyof Deal];
    const updatedDeal = { ...deal, [field]: value };

    // Optimistic update
    onDealUpdate(updatedDeal);
    setEditingField(null);

    try {
      await updateDeal(deal.id, { [field]: value });
      toast.success("Updated", `${field.replace("_", " ")} updated`);
    } catch {
      // Rollback
      onDealUpdate({ ...deal, [field]: previousValue });
      toast.error("Failed to update", "Please try again");
    }
  };

  // Handle task completion toggle
  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "completed" ? "not_started" : "completed";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(task.id, { status: newStatus });
    } catch {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      toast.error("Failed to update task", "Please try again");
    }
  };

  if (!deal) return null;

  const address = [deal.address, deal.city, deal.state, deal.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <SlideOver open={open} onClose={onClose} title={deal.name}>
      <div className="p-4 space-y-6">
        {/* Status */}
        <SlideOverField label="Status">
          {editingField === "status" ? (
            <InlineSelectEdit
              value={deal.status}
              options={statusOptions}
              onSave={(value) => handleFieldUpdate("status", value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <div
              onClick={() => setEditingField("status")}
              className="cursor-pointer"
            >
              <StatusBadge status={deal.status} statusMap={dealStatusMap} />
            </div>
          )}
        </SlideOverField>

        {/* Address */}
        <SlideOverField label="Property Address">
          <span className="text-[14px] text-[#EDEDED]">
            {address || "No address specified"}
          </span>
        </SlideOverField>

        {/* Property Type */}
        <SlideOverField label="Property Type">
          {editingField === "property_type" ? (
            <InlineSelectEdit
              value={deal.property_type || ""}
              options={propertyTypeOptions}
              onSave={(value) => handleFieldUpdate("property_type", value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <span
              onClick={() => setEditingField("property_type")}
              className="text-[14px] text-[#EDEDED] capitalize cursor-pointer hover:text-[#60A5FA] transition-colors"
            >
              {deal.property_type?.replace("-", " ") || "Not specified"}
            </span>
          )}
        </SlideOverField>

        {/* Square Footage */}
        {deal.sf && (
          <SlideOverField label="Square Footage">
            <span className="text-[14px] text-[#EDEDED]">
              {deal.sf.toLocaleString()} SF
            </span>
          </SlideOverField>
        )}

        <SlideOverDivider />

        {/* Tasks Section */}
        <SlideOverSection
          title="Tasks"
          count={tasks.length}
          onAdd={() => toast.info("Add tasks from deal page", "Navigate to the deal to add tasks")}
        >
          {loadingTasks ? (
            <div className="text-[13px] text-[#6B6B6B]">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-[13px] text-[#6B6B6B]">No tasks yet</div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isBlocked = task.status === "blocked";
                const isInProgress = task.status === "in_progress";

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 py-1.5 group"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isCompleted
                        ? "bg-[#3ECF8E] border-[#3ECF8E]"
                        : isBlocked
                          ? "border-[#F87171]"
                          : "border-[#3E3E3E] hover:border-[#4E4E4E]"
                        }`}
                    >
                      {isCompleted && <Check className="h-2.5 w-2.5 text-[#1C1C1C]" />}
                      {isBlocked && <AlertTriangle className="h-2.5 w-2.5 text-[#F87171]" />}
                      {isInProgress && <Circle className="h-2 w-2 text-[#60A5FA] fill-[#60A5FA]" />}
                    </button>
                    <span
                      className={`text-[13px] truncate ${isCompleted ? "text-[#6B6B6B] line-through" : "text-[#EDEDED]"
                        }`}
                    >
                      {task.task}
                    </span>
                    {isInProgress && (
                      <span className="text-[11px] text-[#60A5FA] ml-auto flex-shrink-0">
                        In Progress
                      </span>
                    )}
                    {isBlocked && (
                      <span className="text-[11px] text-[#F87171] ml-auto flex-shrink-0">
                        Blocked
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SlideOverSection>

        <SlideOverDivider />

        {/* Contacts Section */}
        <SlideOverSection
          title="Contacts"
          count={contacts.length}
          onAdd={() => toast.info("Add contacts from deal page", "Navigate to the deal to add contacts")}
        >
          {loadingContacts ? (
            <div className="text-[13px] text-[#6B6B6B]">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-[13px] text-[#6B6B6B]">No contacts yet</div>
          ) : (
            <div className="space-y-3">
              {contacts.map((dc) => (
                <div key={dc.contact.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-[12px] font-medium text-[#A78BFA] flex-shrink-0">
                    {dc.contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-[#EDEDED] truncate">
                        {dc.contact.name}
                      </span>
                      {dc.contact.role && (
                        <span className="text-[11px] text-[#6B6B6B] capitalize">
                          {dc.contact.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {dc.contact.email && (
                        <a
                          href={`mailto:${dc.contact.email}`}
                          className="flex items-center gap-1 text-[12px] text-[#A1A1A1] hover:text-[#60A5FA] transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{dc.contact.email}</span>
                        </a>
                      )}
                      {dc.contact.phone && (
                        <a
                          href={`tel:${dc.contact.phone}`}
                          className="flex items-center gap-1 text-[12px] text-[#A1A1A1] hover:text-[#60A5FA] transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{dc.contact.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SlideOverSection>

        <SlideOverDivider />

        {/* Activity Section */}
        <SlideOverSection title="Activity">
          <div className="space-y-2">
            <div className="flex items-start gap-3 py-1">
              <span className="text-[12px] text-[#6B6B6B] w-16 flex-shrink-0">
                {deal.created_at
                  ? new Date(deal.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                  : "—"}
              </span>
              <span className="text-[13px] text-[#A1A1A1]">Deal created</span>
            </div>
          </div>
        </SlideOverSection>
      </div>
    </SlideOver>
  );
}
