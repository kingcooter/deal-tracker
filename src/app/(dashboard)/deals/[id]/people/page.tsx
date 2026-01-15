"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Building,
  Trash2,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  getDealContacts,
  getContacts,
  addContactToDeal,
  removeContactFromDeal,
} from "@/lib/supabase/queries";
import type { Contact } from "@/lib/supabase/types";

// Role styling map (consistent with contacts page)
const roleStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  internal: { bg: "rgba(107, 107, 107, 0.15)", text: "#A1A1A1", label: "Internal" },
  broker: { bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA", label: "Broker" },
  lender: { bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E", label: "Lender" },
  attorney: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24", label: "Attorney" },
  contractor: { bg: "rgba(248, 113, 113, 0.15)", text: "#F87171", label: "Contractor" },
  vendor: { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA", label: "Vendor" },
  other: { bg: "rgba(107, 107, 107, 0.15)", text: "#6B6B6B", label: "Other" },
};

// Common relationship types for deals
const relationshipOptions = [
  { value: "", label: "Select relationship..." },
  { value: "Buyer's Agent", label: "Buyer's Agent" },
  { value: "Seller's Agent", label: "Seller's Agent" },
  { value: "Listing Agent", label: "Listing Agent" },
  { value: "Lender", label: "Lender" },
  { value: "Attorney", label: "Attorney" },
  { value: "Title Company", label: "Title Company" },
  { value: "Inspector", label: "Inspector" },
  { value: "Appraiser", label: "Appraiser" },
  { value: "Property Manager", label: "Property Manager" },
  { value: "Contractor", label: "Contractor" },
  { value: "Investor", label: "Investor" },
  { value: "Other", label: "Other" },
];

interface DealContactWithContact {
  deal_id: string;
  contact_id: string;
  relationship: string | null;
  contact: Contact;
}

export default function DealPeoplePage() {
  const params = useParams();
  const dealId = params.id as string;
  const queryClient = useQueryClient();
  const toast = useToastActions();

  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedContactId, setSelectedContactId] = React.useState("");
  const [relationship, setRelationship] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
  const [contactToRemove, setContactToRemove] = React.useState<DealContactWithContact | null>(null);

  // Fetch deal contacts
  const { data: dealContacts = [], isLoading } = useQuery({
    queryKey: ["deal-contacts", dealId],
    queryFn: () => getDealContacts(dealId),
    staleTime: 30 * 1000,
  });

  // Fetch all contacts for the add dialog
  const { data: allContacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
    staleTime: 60 * 1000,
  });

  // Filter contacts that are not already linked to this deal
  const availableContacts = React.useMemo(() => {
    const linkedIds = new Set((dealContacts as DealContactWithContact[]).map((dc) => dc.contact_id));
    return allContacts.filter((c) => !linkedIds.has(c.id));
  }, [allContacts, dealContacts]);

  // Filter available contacts by search term
  const filteredContacts = React.useMemo(() => {
    if (!searchTerm) return availableContacts;
    const lower = searchTerm.toLowerCase();
    return availableContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower) ||
        c.company?.toLowerCase().includes(lower)
    );
  }, [availableContacts, searchTerm]);

  // Handle adding a contact to the deal
  const handleAddContact = async () => {
    if (!selectedContactId) return;

    setAdding(true);
    try {
      await addContactToDeal(dealId, selectedContactId, relationship || undefined);
      queryClient.invalidateQueries({ queryKey: ["deal-contacts", dealId] });
      toast.success("Contact added", "Contact has been linked to this deal");
      setShowAddDialog(false);
      setSelectedContactId("");
      setRelationship("");
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact", "Please try again");
    } finally {
      setAdding(false);
    }
  };

  // Handle removing a contact from the deal
  const handleRemoveContact = async () => {
    if (!contactToRemove) return;

    setRemovingId(contactToRemove.contact_id);
    try {
      await removeContactFromDeal(dealId, contactToRemove.contact_id);
      queryClient.invalidateQueries({ queryKey: ["deal-contacts", dealId] });
      toast.success("Contact removed", "Contact has been unlinked from this deal");
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error("Failed to remove contact", "Please try again");
    } finally {
      setRemovingId(null);
      setShowRemoveDialog(false);
      setContactToRemove(null);
    }
  };

  // Role Badge Component
  const RoleBadge = ({ role }: { role: string | null }) => {
    if (!role) return null;
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

  // Contact Card Component
  const ContactCard = ({ dealContact }: { dealContact: DealContactWithContact }) => {
    const contact = dealContact.contact;
    const isRemoving = removingId === contact.id;

    return (
      <Card className="p-4 hover:bg-surface-hover transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-sm font-medium text-[#A78BFA]">
              {contact.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground truncate">
                  {contact.name}
                </span>
                <RoleBadge role={contact.role} />
              </div>

              {/* Relationship */}
              {dealContact.relationship && (
                <div className="text-xs text-primary mt-0.5">
                  {dealContact.relationship}
                </div>
              )}

              {/* Company */}
              {contact.company && (
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted mt-1">
                  <Building className="h-3 w-3" />
                  <span className="truncate">{contact.company}</span>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex items-center gap-4 mt-2">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1 text-xs text-foreground-muted hover:text-primary transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1 text-xs text-foreground-muted hover:text-primary transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-foreground-muted hover:text-error"
            onClick={() => {
              setContactToRemove(dealContact);
              setShowRemoveDialog(true);
            }}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">People</h2>
            <p className="text-sm text-foreground-muted">
              Manage contacts associated with this deal
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        </div>
      </div>
    );
  }

  const typedDealContacts = dealContacts as DealContactWithContact[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">People</h2>
          <p className="text-sm text-foreground-muted">
            {typedDealContacts.length === 0
              ? "Manage contacts associated with this deal"
              : `${typedDealContacts.length} contact${typedDealContacts.length === 1 ? "" : "s"} linked to this deal`}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Contact List or Empty State */}
      {typedDealContacts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-elevated">
              <Users className="h-8 w-8 text-foreground-subtle" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No contacts yet</h3>
          <p className="text-sm text-foreground-muted mb-4 max-w-sm mx-auto">
            Add contacts to keep track of everyone involved in this deal - buyers, sellers, agents, attorneys, and more.
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Contact
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {typedDealContacts.map((dc) => (
            <ContactCard key={dc.contact_id} dealContact={dc} />
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact to Deal</DialogTitle>
            <DialogDescription>
              Link an existing contact to this deal
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Contact List */}
            <div className="max-h-[200px] overflow-y-auto border border-border rounded-md">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-sm text-foreground-muted">
                  {availableContacts.length === 0
                    ? "All contacts are already linked to this deal"
                    : "No contacts found"}
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-surface-hover transition-colors border-b border-border last:border-b-0 ${
                      selectedContactId === contact.id ? "bg-surface-elevated" : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(167,139,250,0.15)] text-xs font-medium text-[#A78BFA]">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {contact.name}
                        </span>
                        <RoleBadge role={contact.role} />
                      </div>
                      {contact.company && (
                        <span className="text-xs text-foreground-muted truncate block">
                          {contact.company}
                        </span>
                      )}
                    </div>
                    {selectedContactId === contact.id && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Relationship to Deal
              </label>
              <Select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                {relationshipOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-foreground-muted">
                Describe this contact&apos;s role in this specific deal
              </p>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddContact}
              disabled={!selectedContactId}
              loading={adding}
            >
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {contactToRemove?.contact.name} from this deal?
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-foreground-muted">
              This will only unlink the contact from this deal. The contact will still exist in your contacts list.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveContact}
              loading={removingId !== null}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
