"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings, Trash2, AlertTriangle } from "lucide-react";
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
import { getDeal, updateDeal, deleteDeal } from "@/lib/supabase/queries";
import type { Deal } from "@/lib/supabase/types";

const propertyTypes = [
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail" },
  { value: "industrial", label: "Industrial" },
  { value: "multifamily", label: "Multifamily" },
  { value: "land", label: "Land" },
  { value: "mixed-use", label: "Mixed Use" },
];

const statusOptions = [
  { value: "active", label: "Under Contract" },
  { value: "on-hold", label: "On Hold" },
  { value: "closed", label: "Closed Won" },
];

export default function DealSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToastActions();
  const dealId = params.id as string;

  const [saving, setSaving] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const { data: deal } = useQuery<Deal>({
    queryKey: ["deal", dealId],
    queryFn: () => getDeal(dealId),
    staleTime: 60 * 1000,
  });

  const [form, setForm] = React.useState({
    name: "",
    status: "active" as "active" | "on-hold" | "closed",
    address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "office",
    sf: "",
    year_built: "",
    notes: "",
  });

  // Sync form with deal data
  React.useEffect(() => {
    if (deal) {
      setForm({
        name: deal.name || "",
        status: deal.status || "active",
        address: deal.address || "",
        city: deal.city || "",
        state: deal.state || "",
        zip: deal.zip || "",
        property_type: deal.property_type || "office",
        sf: deal.sf?.toString() || "",
        year_built: deal.year_built?.toString() || "",
        notes: deal.notes || "",
      });
    }
  }, [deal]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name required", "Please enter a deal name");
      return;
    }

    setSaving(true);
    try {
      await updateDeal(dealId, {
        name: form.name.trim(),
        status: form.status,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        property_type: form.property_type || null,
        sf: form.sf ? parseInt(form.sf) : null,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        notes: form.notes || null,
      });

      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Settings saved", "Deal settings have been updated");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save", "Please try again");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDeal(dealId);
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted", "The deal has been removed");
      router.push("/deals");
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("Failed to delete", "Please try again");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!deal) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">General Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Deal Name *
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter deal name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "on-hold" | "closed" })}
              >
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="property_type" className="text-sm font-medium text-foreground">
                Property Type
              </label>
              <Select
                id="property_type"
                value={form.property_type}
                onChange={(e) => setForm({ ...form, property_type: e.target.value })}
              >
                {propertyTypes.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Location</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-foreground">
              Address
            </label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium text-foreground">
                City
              </label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium text-foreground">
                State
              </label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="TX"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="zip" className="text-sm font-medium text-foreground">
                ZIP
              </label>
              <Input
                id="zip"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                placeholder="ZIP"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Property Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="sf" className="text-sm font-medium text-foreground">
              Square Footage
            </label>
            <Input
              id="sf"
              type="number"
              value={form.sf}
              onChange={(e) => setForm({ ...form, sf: e.target.value })}
              placeholder="50000"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="year_built" className="text-sm font-medium text-foreground">
              Year Built
            </label>
            <Input
              id="year_built"
              type="number"
              value={form.year_built}
              onChange={(e) => setForm({ ...form, year_built: e.target.value })}
              placeholder="2020"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-foreground">
            Notes
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Additional notes about this deal..."
            rows={4}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="p-6 border-error/50">
        <h3 className="text-lg font-semibold text-error mb-2">Danger Zone</h3>
        <p className="text-sm text-foreground-muted mb-4">
          Permanently delete this deal and all associated workflows, tasks, and data.
          This action cannot be undone.
        </p>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Deal
        </Button>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-5 w-5" />
              Delete Deal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deal.name}&quot;? This will permanently remove:
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1">
              <li>All workflows associated with this deal</li>
              <li>All tasks and their history</li>
              <li>All contacts linked to this deal</li>
              <li>All uploaded documents and files</li>
            </ul>
            <p className="text-sm text-foreground-muted mt-4">
              This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              Delete Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
