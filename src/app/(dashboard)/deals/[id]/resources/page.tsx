"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  Loader2,
  Trash2,
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  Filter,
  X,
  ExternalLink,
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
  getDealDocuments,
  createDealDocument,
  deleteDealDocument,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import type { DealDocument, DocumentCategory } from "@/lib/supabase/types";

// Document categories
const documentCategories: { value: DocumentCategory; label: string }[] = [
  { value: "contract", label: "Contract" },
  { value: "inspection", label: "Inspection" },
  { value: "appraisal", label: "Appraisal" },
  { value: "title", label: "Title" },
  { value: "environmental", label: "Environmental" },
  { value: "survey", label: "Survey" },
  { value: "lease", label: "Lease" },
  { value: "financial", label: "Financial" },
  { value: "photo", label: "Photo" },
  { value: "legal", label: "Legal" },
  { value: "permit", label: "Permit" },
  { value: "other", label: "Other" },
];

// Category styling
const categoryStyles: Record<string, { bg: string; text: string }> = {
  contract: { bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA" },
  inspection: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  appraisal: { bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E" },
  title: { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA" },
  environmental: { bg: "rgba(52, 211, 153, 0.15)", text: "#34D399" },
  survey: { bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
  lease: { bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA" },
  financial: { bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E" },
  photo: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  legal: { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA" },
  permit: { bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
  other: { bg: "rgba(107, 107, 107, 0.15)", text: "#A1A1A1" },
};

// Get icon for file type
function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) return FileSpreadsheet;
  return FileText;
}

// Format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DealResourcesPage() {
  const params = useParams();
  const dealId = params.id as string;
  const queryClient = useQueryClient();
  const toast = useToastActions();

  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadCategory, setUploadCategory] = React.useState<DocumentCategory>("other");
  const [uploadDescription, setUploadDescription] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [filterCategory, setFilterCategory] = React.useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [documentToDelete, setDocumentToDelete] = React.useState<DealDocument | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch documents
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ["deal-documents", dealId],
    queryFn: () => getDealDocuments(dealId),
    staleTime: 30 * 1000,
  });

  // Filter documents by category
  const filteredDocuments = React.useMemo(() => {
    if (!filterCategory) return documents as DealDocument[];
    return (documents as DealDocument[]).filter((doc) => doc.category === filterCategory);
  }, [documents, filterCategory]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      setShowUploadDialog(true);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Not authenticated", "Please log in to upload files");
        return;
      }

      for (const file of selectedFiles) {
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${dealId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("deal-documents")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          // If bucket doesn't exist, show helpful error
          if (uploadError.message.includes("not found") || uploadError.message.includes("Bucket")) {
            toast.error(
              "Storage not configured",
              "Please create the 'deal-documents' bucket in Supabase Storage"
            );
            return;
          }
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("deal-documents")
          .getPublicUrl(fileName);

        // Create database record
        await createDealDocument({
          deal_id: dealId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          category: uploadCategory,
          description: uploadDescription || undefined,
          user_id: user.id,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["deal-documents", dealId] });
      toast.success(
        "Files uploaded",
        `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} uploaded successfully`
      );

      // Reset state
      setShowUploadDialog(false);
      setSelectedFiles([]);
      setUploadCategory("other");
      setUploadDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed", "Please try again");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    try {
      await deleteDealDocument(documentToDelete.id);

      // Also delete from storage (extract path from URL)
      const supabase = createClient();
      const urlParts = documentToDelete.file_url.split("/deal-documents/");
      if (urlParts.length > 1) {
        await supabase.storage.from("deal-documents").remove([urlParts[1]]);
      }

      queryClient.invalidateQueries({ queryKey: ["deal-documents", dealId] });
      toast.success("Document deleted", "The document has been removed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed", "Please try again");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };

  // Category Badge Component
  const CategoryBadge = ({ category }: { category: string }) => {
    const style = categoryStyles[category] || categoryStyles.other;
    const label = documentCategories.find((c) => c.value === category)?.label || category;
    return (
      <span
        className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded capitalize"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {label}
      </span>
    );
  };

  // Document Card Component
  const DocumentCard = ({ document }: { document: DealDocument }) => {
    const FileIcon = getFileIcon(document.file_type);
    const uploadDate = new Date(document.uploaded_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <Card className="p-4 hover:bg-surface-hover transition-colors group">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
            <FileIcon className="h-5 w-5 text-foreground-muted" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {document.file_name}
              </span>
              <CategoryBadge category={document.category} />
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-foreground-muted">
              {document.file_size && <span>{formatFileSize(document.file_size)}</span>}
              <span>{uploadDate}</span>
            </div>

            {document.description && (
              <p className="text-xs text-foreground-muted mt-1 truncate">
                {document.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover:bg-surface-elevated text-foreground-muted hover:text-foreground transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={document.file_url}
              download={document.file_name}
              className="p-2 rounded-md hover:bg-surface-elevated text-foreground-muted hover:text-foreground transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              onClick={() => {
                setDocumentToDelete(document);
                setShowDeleteDialog(true);
              }}
              className="p-2 rounded-md hover:bg-surface-elevated text-foreground-muted hover:text-error transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    );
  };

  // Check if table doesn't exist (migration not run)
  const tableNotExists = error && (error as Error).message?.includes("deal_documents");

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Resources</h2>
            <p className="text-sm text-foreground-muted">
              Documents and files for this deal
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        </div>
      </div>
    );
  }

  // Table not exists state (migration not run)
  if (tableNotExists) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Resources</h2>
            <p className="text-sm text-foreground-muted">
              Documents and files for this deal
            </p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-elevated">
              <FileText className="h-8 w-8 text-foreground-subtle" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Setup Required</h3>
          <p className="text-sm text-foreground-muted mb-4 max-w-md mx-auto">
            The document management feature requires a database migration. Please run the migration file:
          </p>
          <code className="text-xs bg-surface-elevated px-3 py-2 rounded-md text-foreground-muted block max-w-md mx-auto">
            supabase/migrations/20260115000002_add_deal_documents.sql
          </code>
        </Card>
      </div>
    );
  }

  const typedDocuments = filteredDocuments as DealDocument[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Resources</h2>
          <p className="text-sm text-foreground-muted">
            {(documents as DealDocument[]).length === 0
              ? "Documents and files for this deal"
              : `${(documents as DealDocument[]).length} document${(documents as DealDocument[]).length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.txt"
        />
      </div>

      {/* Filter */}
      {(documents as DealDocument[]).length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-40"
          >
            <option value="">All categories</option>
            {documentCategories.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {filterCategory && (
            <button
              onClick={() => setFilterCategory("")}
              className="text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Document List or Empty State */}
      {typedDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-elevated">
              <FileText className="h-8 w-8 text-foreground-subtle" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {filterCategory ? "No documents in this category" : "No documents yet"}
          </h3>
          <p className="text-sm text-foreground-muted mb-4 max-w-sm mx-auto">
            {filterCategory
              ? "Try selecting a different category or upload new documents."
              : "Upload documents, contracts, photos, and other files related to this deal for easy access and organization."}
          </p>
          {!filterCategory && (
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-3">
          {typedDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* Selected Files */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Files</label>
              <div className="max-h-[150px] overflow-y-auto border border-border rounded-md divide-y divide-border">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 text-sm">
                    <FileText className="h-4 w-4 text-foreground-muted shrink-0" />
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-foreground-muted shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
              >
                {documentCategories.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-foreground-muted">(optional)</span>
              </label>
              <Input
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description of these files..."
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setSelectedFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} loading={uploading}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{documentToDelete?.file_name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-foreground-muted">
              This will permanently delete the file from storage. This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
