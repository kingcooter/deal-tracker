"use client";

import * as React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type ConfirmVariant = "danger" | "warning" | "default";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; buttonVariant: "destructive" | "default" | "secondary" }> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-error/10",
    iconColor: "text-error",
    buttonVariant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    buttonVariant: "default",
  },
  default: {
    icon: AlertTriangle,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    buttonVariant: "default",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogBody className="pt-6 text-center">
          <div className={cn("mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4", config.iconBg)}>
            <Icon className={cn("h-6 w-6", config.iconColor)} />
          </div>
          <DialogTitle className="text-center mb-2">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogBody>

        <DialogFooter className="sm:justify-center gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy confirm dialog usage
interface UseConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: ConfirmVariant;
}

export function useConfirm() {
  const [state, setState] = React.useState<{
    open: boolean;
    options: UseConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: null,
    resolve: null,
  });

  const confirm = React.useCallback((options: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState({ open: false, options: null, resolve: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resolve]);

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false);
    setState({ open: false, options: null, resolve: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resolve]);

  const ConfirmDialogComponent = React.useCallback(() => {
    if (!state.options) return null;

    return (
      <ConfirmDialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title={state.options.title}
        description={state.options.description}
        confirmLabel={state.options.confirmLabel}
        variant={state.options.variant}
        onConfirm={handleConfirm}
      />
    );
  }, [state.open, state.options, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
