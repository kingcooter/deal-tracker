"use client";

import * as React from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

interface LightboxProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ src, alt, open, onClose }: LightboxProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  // Reset state when opened
  React.useEffect(() => {
    if (open) {
      setScale(1);
      setRotation(0);
    }
  }, [open]);

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(s + 0.25, 3));
      } else if (e.key === "-") {
        setScale((s) => Math.max(s - 0.25, 0.5));
      } else if (e.key === "r") {
        setRotation((r) => (r + 90) % 360);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = alt || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface/90 backdrop-blur-sm rounded-lg border border-border px-2 py-1.5 z-10">
        <ToolbarButton onClick={handleZoomOut} title="Zoom out (-)">
          <ZoomOut className="h-4 w-4" />
        </ToolbarButton>
        <span className="text-xs text-foreground-muted min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <ToolbarButton onClick={handleZoomIn} title="Zoom in (+)">
          <ZoomIn className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton onClick={handleRotate} title="Rotate (R)">
          <RotateCw className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton onClick={onClose} title="Close (Esc)">
          <X className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Image container */}
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Caption */}
      {alt && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm rounded-lg border border-border px-4 py-2">
          <p className="text-sm text-foreground">{alt}</p>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Hook to manage lightbox state
 */
export function useLightbox() {
  const [lightbox, setLightbox] = React.useState<{
    open: boolean;
    src: string;
    alt: string;
  }>({
    open: false,
    src: "",
    alt: "",
  });

  const openLightbox = React.useCallback((src: string, alt: string) => {
    setLightbox({ open: true, src, alt });
  }, []);

  const closeLightbox = React.useCallback(() => {
    setLightbox((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    lightboxProps: {
      open: lightbox.open,
      src: lightbox.src,
      alt: lightbox.alt,
      onClose: closeLightbox,
    },
    openLightbox,
    closeLightbox,
  };
}
