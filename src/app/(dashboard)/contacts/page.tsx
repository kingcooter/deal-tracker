"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Building } from "lucide-react";
import {
  TableLayout,
  Toolbar,
  Pagination,
  DataTable,
  InlineTextEdit,
  InlineSelectEdit,
} from "@/components/table-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToastActions } from "@/components/ui/toast";
import { getContacts, createContact, updateContact } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";

// Role styling map
const roleStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  internal: {
    bg: "rgba(107, 107, 107, 0.15)",
    text: "#A1A1A1",
    label: "Internal",
  },
  broker: {
    bg: "rgba(96, 165, 250, 0.15)",
    text: "#60A5FA",
    label: "Broker",
  },
  lender: {
    bg: "rgba(62, 207, 142, 0.15)",
    text: "#3ECF8E",
    label: "Lender",
  },
  attorney: {
    bg: "rgba(251, 191, 36, 0.15)",
    text: "#FBBF24",
    label: "Attorney",
  },
  contractor: {
    bg: "rgba(248, 113, 113, 0.15)",
    text: "#F87171",
    label: "Contractor",
  },
  vendor: {
    bg: "rgba(167, 139, 250, 0.15)",
    text: "#A78BFA",
    label: "Vendor",
  },
  other: {
    bg: "rgba(107, 107, 107, 0.15)",
    text: "#6B6B6B",
    label: "Other",
  },
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

export default function ContactsPage() {
  const router = useRouter();
  const toast = useToastActions();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [newContact, setNewContact] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "other",
    notes: "",
  });

  // Inline editing state
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  const isEditing = (rowId: string, columnId: string) =>
    editingCell?.rowId === rowId && editingCell?.columnId === columnId;

  // Handle double-click to edit
  const handleRowDoubleClick = (contact: Contact, columnId: string) => {
    // Only allow editing on specific columns
    if (["name", "email", "phone", "company", "role", "notes"].includes(columnId)) {
      setEditingCell({ rowId: contact.id, columnId });
    }
  };

  // Handle inline save
  const handleInlineSave = async (contactId: string, field: string, value: string | null) => {
    try {
      const updated = await updateContact(contactId, { [field]: value || null });
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, ...updated } : c))
      );
      toast.success("Updated", `Contact ${field} has been saved`);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Update failed", "Please try again");
    } finally {
      setEditingCell(null);
    }
  };

  const handleInlineCancel = () => {
    setEditingCell(null);
  };

  // Fetch contacts
  React.useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to load contacts", "Please refresh the page");
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, [toast]);

  // Pagination
  const totalPages = Math.ceil(contacts.length / rowsPerPage);
  const paginatedContacts = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return contacts.slice(start, start + rowsPerPage);
  }, [contacts, currentPage, rowsPerPage]);

  // Selection
  const isAllSelected = selectedIds.size === paginatedContacts.length && paginatedContacts.length > 0;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < paginatedContacts.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedContacts.map((c) => c.id)));
    }
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle create contact
  const handleCreateContact = async () => {
    if (!newContact.name) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Not authenticated", "Please log in to create a contact");
        return;
      }

      const created = await createContact({
        name: newContact.name,
        email: newContact.email || null,
        phone: newContact.phone || null,
        company: newContact.company || null,
        role: newContact.role || null,
        notes: newContact.notes || null,
        user_id: user.id,
      });

      setContacts((prev) => [created, ...prev]);
      setShowCreateDialog(false);
      setNewContact({
        name: "",
        email: "",
        phone: "",
        company: "",
        role: "other",
        notes: "",
      });
      toast.success("Contact added", `"${created.name}" has been added`);
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to add contact", "Please try again");
    } finally {
      setSaving(false);
    }
  };

  // Role Badge Component
  const RoleBadge = ({ role }: { role: string | null }) => {
    if (!role) return <span className="text-[13px] text-[#6B6B6B]">—</span>;

    const style = roleStyleMap[role] || roleStyleMap.other;
    return (
      <span
        className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
  };

  // Role options for inline select
  const roleSelectOptions = roleOptions.map(({ value, label }) => ({
    value,
    label,
    bg: roleStyleMap[value]?.bg || "rgba(107, 107, 107, 0.15)",
    text: roleStyleMap[value]?.text || "#6B6B6B",
  }));

  // Table columns
  const columns = [
    {
      id: "name",
      header: "Name",
      width: "20%",
      editable: true,
      render: (contact: Contact) =>
        isEditing(contact.id, "name") ? (
          <InlineTextEdit
            value={contact.name}
            onSave={(value) => handleInlineSave(contact.id, "name", value)}
            onCancel={handleInlineCancel}
            placeholder="Contact name"
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-[11px] font-medium text-[#A78BFA]">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-[#EDEDED] truncate">
              {contact.name}
            </span>
          </div>
        ),
    },
    {
      id: "role",
      header: "Role",
      width: "12%",
      editable: true,
      render: (contact: Contact) =>
        isEditing(contact.id, "role") ? (
          <InlineSelectEdit
            value={contact.role || "other"}
            options={roleSelectOptions}
            onSave={(value) => handleInlineSave(contact.id, "role", value)}
            onCancel={handleInlineCancel}
          />
        ) : (
          <RoleBadge role={contact.role} />
        ),
    },
    {
      id: "company",
      header: "Company",
      width: "18%",
      editable: true,
      render: (contact: Contact) =>
        isEditing(contact.id, "company") ? (
          <InlineTextEdit
            value={contact.company || ""}
            onSave={(value) => handleInlineSave(contact.id, "company", value)}
            onCancel={handleInlineCancel}
            placeholder="Company name"
          />
        ) : contact.company ? (
          <div className="flex items-center gap-1.5 text-[13px] text-[#A1A1A1]">
            <Building className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{contact.company}</span>
          </div>
        ) : (
          <span className="text-[13px] text-[#6B6B6B]">—</span>
        ),
    },
    {
      id: "email",
      header: "Email",
      width: "22%",
      editable: true,
      render: (contact: Contact) =>
        isEditing(contact.id, "email") ? (
          <InlineTextEdit
            value={contact.email || ""}
            onSave={(value) => handleInlineSave(contact.id, "email", value)}
            onCancel={handleInlineCancel}
            placeholder="email@example.com"
          />
        ) : contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[13px] text-[#A1A1A1] hover:text-[#60A5FA] transition-colors truncate"
          >
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </a>
        ) : (
          <span className="text-[13px] text-[#6B6B6B]">—</span>
        ),
    },
    {
      id: "phone",
      header: "Phone",
      width: "15%",
      editable: true,
      render: (contact: Contact) =>
        isEditing(contact.id, "phone") ? (
          <InlineTextEdit
            value={contact.phone || ""}
            onSave={(value) => handleInlineSave(contact.id, "phone", value)}
            onCancel={handleInlineCancel}
            placeholder="(555) 555-0123"
          />
        ) : contact.phone ? (
          <a
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[13px] text-[#A1A1A1] hover:text-[#60A5FA] transition-colors"
          >
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{contact.phone}</span>
          </a>
        ) : (
          <span className="text-[13px] text-[#6B6B6B]">—</span>
        ),
    },
    {
      id: "notes",
      header: "Notes",
      width: "13%",
      editable: true,
      render: (contact: Contact) =>
        isEditing(contact.id, "notes") ? (
          <InlineTextEdit
            value={contact.notes || ""}
            onSave={(value) => handleInlineSave(contact.id, "notes", value)}
            onCancel={handleInlineCancel}
            placeholder="Add notes..."
          />
        ) : (
          <span className="text-[13px] text-[#6B6B6B] truncate block max-w-[150px]">
            {contact.notes || "—"}
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <TableLayout activeTable="contacts">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[13px] text-[#6B6B6B]">Loading contacts...</div>
        </div>
      </TableLayout>
    );
  }

  return (
    <TableLayout activeTable="contacts">
      {/* Toolbar */}
      <Toolbar
        onNewClick={() => setShowCreateDialog(true)}
        newButtonLabel="New Contact"
      />

      {/* Data Table */}
      <DataTable
        data={paginatedContacts}
        columns={columns}
        selectedIds={selectedIds}
        onSelectAll={toggleAll}
        onSelectRow={toggleRow}
        onRowClick={(contact) => router.push(`/contacts/${contact.id}`)}
        onRowDoubleClick={handleRowDoubleClick}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        getRowId={(contact) => contact.id}
        emptyMessage="No contacts yet. Click 'New Contact' to add one."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        totalRecords={contacts.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />

      {/* Create Contact Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#EDEDED]">
                Name *
              </label>
              <Input
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EDEDED]">
                  Email
                </label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EDEDED]">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  placeholder="(555) 555-0123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EDEDED]">
                  Company
                </label>
                <Input
                  value={newContact.company}
                  onChange={(e) =>
                    setNewContact({ ...newContact, company: e.target.value })
                  }
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EDEDED]">
                  Role
                </label>
                <Select
                  value={newContact.role}
                  onChange={(e) =>
                    setNewContact({ ...newContact, role: e.target.value })
                  }
                >
                  {roleOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#EDEDED]">
                Notes
              </label>
              <Textarea
                value={newContact.notes}
                onChange={(e) =>
                  setNewContact({ ...newContact, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateContact}
              disabled={!newContact.name}
              loading={saving}
            >
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableLayout>
  );
}
