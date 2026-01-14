"use client";

import * as React from "react";
import { SlideOver, SlideOverField, SlideOverDivider } from "./slide-over";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createDeal } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import { useToastActions } from "@/components/ui/toast";
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
  { value: "closed", label: "Closed Won" },
  { value: "on-hold", label: "On Hold" },
];

interface NewDealPanelProps {
  open: boolean;
  onClose: () => void;
  onDealCreated: (deal: Deal) => void;
}

export function NewDealPanel({ open, onClose, onDealCreated }: NewDealPanelProps) {
  const toast = useToastActions();
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "office",
    status: "active",
    notes: "",
  });

  // Reset form when panel opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        property_type: "office",
        status: "active",
        notes: "",
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name required", "Please enter a deal name");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Not authenticated", "Please log in to create a deal");
        return;
      }

      const created = await createDeal({
        name: formData.name.trim(),
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        property_type: formData.property_type || null,
        status: formData.status as "active" | "closed" | "on-hold",
        notes: formData.notes || null,
        image_url: null,
        sf: null,
        lot_size: null,
        year_built: null,
        zoning: null,
        user_id: user.id,
      });

      onDealCreated(created);
      onClose();
      toast.success("Deal created", `"${created.name}" has been added`);
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error("Failed to create deal", "Please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOver open={open} onClose={onClose} title="New Deal">
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-5 overflow-y-auto">
          {/* Deal Name */}
          <SlideOverField label="Deal Name *">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Parkview Tower Acquisition"
              className="bg-[#2A2A2A] border-[#3E3E3E]"
            />
          </SlideOverField>

          {/* Status */}
          <SlideOverField label="Status">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="bg-[#2A2A2A] border-[#3E3E3E]"
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </SlideOverField>

          <SlideOverDivider />

          {/* Property Type */}
          <SlideOverField label="Property Type">
            <Select
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              className="bg-[#2A2A2A] border-[#3E3E3E]"
            >
              {propertyTypes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </SlideOverField>

          {/* Address */}
          <SlideOverField label="Address">
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address"
              className="bg-[#2A2A2A] border-[#3E3E3E]"
            />
          </SlideOverField>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-3 gap-3">
            <SlideOverField label="City">
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="bg-[#2A2A2A] border-[#3E3E3E]"
              />
            </SlideOverField>
            <SlideOverField label="State">
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="TX"
                className="bg-[#2A2A2A] border-[#3E3E3E]"
              />
            </SlideOverField>
            <SlideOverField label="ZIP">
              <Input
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="ZIP"
                className="bg-[#2A2A2A] border-[#3E3E3E]"
              />
            </SlideOverField>
          </div>

          <SlideOverDivider />

          {/* Notes */}
          <SlideOverField label="Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this deal..."
              rows={4}
              className="bg-[#2A2A2A] border-[#3E3E3E]"
            />
          </SlideOverField>
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-[#2A2A2A] flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!formData.name.trim()}>
            Create Deal
          </Button>
        </div>
      </div>
    </SlideOver>
  );
}
