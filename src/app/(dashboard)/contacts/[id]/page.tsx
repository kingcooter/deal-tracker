"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Briefcase,
  User,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import {
  getContact,
  getContactDeals,
  getContactTasks,
  updateContact,
  deleteContact,
} from "@/lib/supabase/queries";
import type { Contact, Deal, Task } from "@/lib/supabase/types";

// Role styling map
const roleStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  internal: { bg: "rgba(107, 107, 107, 0.15)", text: "#A1A1A1", label: "Internal" },
  broker: { bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA", label: "Broker" },
  lender: { bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E", label: "Lender" },
  attorney: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24", label: "Attorney" },
  contractor: { bg: "rgba(248, 113, 113, 0.15)", text: "#F87171", label: "Contractor" },
  vendor: { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA", label: "Vendor" },
  other: { bg: "rgba(107, 107, 107, 0.15)", text: "#6B6B6B", label: "Other" },
};

const roleOptions = [
  { value: "internal", label: "Internal" },
  { value: "broker", label: "Broker" },
  { value: "lender", label: "Lender" },
  { value: "attorney", label: "Attorney" },
  { value: "contractor", label: "Contractor" },
  { value: "vendor", label: "Vendor" },
  { value: "other", label: "Other" },
];

// Status badge styling
const statusConfig: Record<string, { badge: "success" | "warning" | "secondary"; label: string }> = {
  active: { badge: "success", label: "Active" },
  "on-hold": { badge: "warning", label: "On Hold" },
  closed: { badge: "secondary", label: "Closed" },
};

const taskStatusConfig: Record<string, { icon: typeof Circle; color: string; label: string }> = {
  not_started: { icon: Circle, color: "#6B6B6B", label: "To Do" },
  in_progress: { icon: Clock, color: "#60A5FA", label: "In Progress" },
  blocked: { icon: AlertCircle, color: "#F87171", label: "Blocked" },
  completed: { icon: CheckCircle2, color: "#3ECF8E", label: "Done" },
};

interface ContactDealWithDeal {
  deal_id: string;
  contact_id: string;
  relationship: string | null;
  deal: Deal;
}

interface TaskWithWorkflow extends Task {
  workflow: {
    id: string;
    name: string;
    deal: { id: string; name: string } | null;
  } | null;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToastActions();
  const contactId = params.id as string;

  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "other",
    notes: "",
  });

  // Fetch contact
  const { data: contact, isLoading: contactLoading } = useQuery<Contact>({
    queryKey: ["contact", contactId],
    queryFn: () => getContact(contactId),
    staleTime: 60 * 1000,
  });

  // Fetch deals for this contact
  const { data: contactDeals = [] } = useQuery({
    queryKey: ["contact-deals", contactId],
    queryFn: () => getContactDeals(contactId),
    staleTime: 30 * 1000,
  });

  // Fetch tasks assigned to this contact
  const { data: contactTasks = [] } = useQuery({
    queryKey: ["contact-tasks", contactId],
    queryFn: () => getContactTasks(contactId),
    staleTime: 30 * 1000,
  });

  // Initialize edit form when contact loads
  React.useEffect(() => {
    if (contact) {
      setEditForm({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        role: contact.role || "other",
        notes: contact.notes || "",
      });
    }
  }, [contact]);

  // Handle save
  const handleSave = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name required", "Please enter a contact name");
      return;
    }

    setSaving(true);
    try {
      await updateContact(contactId, {
        name: editForm.name.trim(),
        email: editForm.email || null,
        phone: editForm.phone || null,
        company: editForm.company || null,
        role: editForm.role || null,
        notes: editForm.notes || null,
      });

      queryClient.invalidateQueries({ queryKey: ["contact", contactId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated", "Changes have been saved");
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to save", "Please try again");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContact(contactId);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted", "The contact has been removed");
      router.push("/contacts");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete", "Please try again");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Role Badge Component
  const RoleBadge = ({ role }: { role: string | null }) => {
    if (!role) return null;
    const style = roleStyleMap[role] || roleStyleMap.other;
    return (
      <span
        className="inline-flex px-2.5 py-1 text-xs font-medium rounded"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
  };

  // Loading state
  if (contactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  // Not found state
  if (!contact) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-foreground-subtle mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Contact not found</h2>
        <p className="text-foreground-muted mb-4">
          The contact you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/contacts" className="text-primary hover:underline">
          Back to Contacts
        </Link>
      </div>
    );
  }

  const typedContactDeals = contactDeals as ContactDealWithDeal[];
  const typedContactTasks = contactTasks as TaskWithWorkflow[];
  const activeTasks = typedContactTasks.filter((t) => t.status !== "completed");
  const completedTasks = typedContactTasks.filter((t) => t.status === "completed");
  const createdDate = new Date(contact.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-xl font-medium text-[#A78BFA]">
            {contact.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-foreground">{contact.name}</h1>
              <RoleBadge role={contact.role} />
            </div>

            {contact.company && (
              <div className="flex items-center gap-1.5 text-foreground-muted mb-2">
                <Building className="h-4 w-4" />
                <span>{contact.company}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1.5 text-foreground-muted hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1.5 text-foreground-muted hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{contact.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/20">
              <Briefcase className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{typedContactDeals.length}</div>
              <div className="text-xs text-foreground-muted">Deal{typedContactDeals.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{activeTasks.length}</div>
              <div className="text-xs text-foreground-muted">Active Task{activeTasks.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{completedTasks.length}</div>
              <div className="text-xs text-foreground-muted">Completed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Deals Section */}
      <Card className="p-6">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Associated Deals
        </h2>

        {typedContactDeals.length === 0 ? (
          <p className="text-sm text-foreground-muted">No deals associated with this contact.</p>
        ) : (
          <div className="space-y-3">
            {typedContactDeals.map((dc) => {
              const deal = dc.deal;
              const status = statusConfig[deal.status] || statusConfig.active;
              const location = [deal.city, deal.state].filter(Boolean).join(", ");

              return (
                <Link
                  key={dc.deal_id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-elevated">
                      <Building className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{deal.name}</span>
                        <Badge variant={status.badge} className="text-[10px]">{status.label}</Badge>
                      </div>
                      {(location || dc.relationship) && (
                        <div className="flex items-center gap-3 text-xs text-foreground-muted mt-0.5">
                          {location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {location}
                            </span>
                          )}
                          {dc.relationship && (
                            <span className="text-primary">{dc.relationship}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tasks Section */}
      <Card className="p-6">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Assigned Tasks
        </h2>

        {typedContactTasks.length === 0 ? (
          <p className="text-sm text-foreground-muted">No tasks assigned to this contact.</p>
        ) : (
          <div className="space-y-3">
            {typedContactTasks.slice(0, 10).map((task) => {
              const statusInfo = taskStatusConfig[task.status] || taskStatusConfig.not_started;
              const StatusIcon = statusInfo.icon;
              const dueDate = task.due_date
                ? new Date(task.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : null;
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-4 w-4" style={{ color: statusInfo.color }} />
                    <div>
                      <span className="text-sm text-foreground">{task.task}</span>
                      {task.workflow?.deal && (
                        <Link
                          href={`/deals/${task.workflow.deal.id}`}
                          className="block text-xs text-foreground-muted hover:text-primary transition-colors"
                        >
                          {task.workflow.deal.name}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {dueDate && (
                      <span className={`text-xs ${isOverdue ? "text-error" : "text-foreground-muted"}`}>
                        {dueDate}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {typedContactTasks.length > 10 && (
              <p className="text-xs text-foreground-muted text-center pt-2">
                + {typedContactTasks.length - 10} more tasks
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Notes Section */}
      {contact.notes && (
        <Card className="p-6">
          <h2 className="text-sm font-medium text-foreground mb-3">Notes</h2>
          <p className="text-sm text-foreground-muted whitespace-pre-wrap">{contact.notes}</p>
        </Card>
      )}

      {/* Footer */}
      <div className="text-xs text-foreground-muted flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Added {createdDate}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="(555) 555-0123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Company</label>
                <Input
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  {roleOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-error">Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {contact.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-foreground-muted">
              This will permanently delete this contact. They will be removed from all deals and unassigned from all tasks. This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
