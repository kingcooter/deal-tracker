"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  getDealNotes,
  createDealNote,
  updateDealNote,
  deleteDealNote,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import type { DealNote } from "@/lib/supabase/types";

interface DealNotesProps {
  dealId: string;
}

export function DealNotes({ dealId }: DealNotesProps) {
  const queryClient = useQueryClient();
  const toast = useToastActions();
  const [isAdding, setIsAdding] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // Fetch notes
  const { data: notes = [], isLoading, error } = useQuery<DealNote[]>({
    queryKey: ["deal-notes", dealId],
    queryFn: () => getDealNotes(dealId),
    staleTime: 30 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      return createDealNote({
        deal_id: dealId,
        content,
        user_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-notes", dealId] });
      setNewNote("");
      setIsAdding(false);
      toast.success("Note added", "Your note has been saved");
    },
    onError: () => {
      toast.error("Failed to add note", "Please try again");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return updateDealNote(id, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-notes", dealId] });
      setEditingId(null);
      setEditContent("");
      toast.success("Note updated", "Your changes have been saved");
    },
    onError: () => {
      toast.error("Failed to update note", "Please try again");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteDealNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-notes", dealId] });
      setDeleteId(null);
      toast.success("Note deleted", "The note has been removed");
    },
    onError: () => {
      toast.error("Failed to delete note", "Please try again");
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    createMutation.mutate(newNote.trim());
  };

  const handleUpdateNote = (id: string) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ id, content: editContent.trim() });
  };

  const handleStartEdit = (note: DealNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  // Handle table doesn't exist error gracefully
  if (error) {
    const errorMessage = (error as Error).message || "";
    if (errorMessage.includes("deal_notes") || errorMessage.includes("does not exist")) {
      return (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-500/20 shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Setup Required</h3>
              <p className="text-xs text-foreground-muted mb-2">
                The deal notes feature requires a database migration. Run the following command:
              </p>
              <code className="text-xs bg-surface-elevated px-2 py-1 rounded font-mono">
                supabase db push
              </code>
            </div>
          </div>
        </Card>
      );
    }
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes
        </h2>
        {!isAdding && (
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="mb-4 p-3 rounded-lg border border-border bg-surface">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note about this deal..."
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              loading={createMutation.isPending}
            >
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-8 w-8 mx-auto text-foreground-subtle mb-2" />
          <p className="text-sm text-foreground-muted">No notes yet</p>
          <p className="text-xs text-foreground-subtle mt-1">
            Add notes to track important details about this deal
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors"
            >
              {editingId === note.id ? (
                // Edit Mode
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={!editContent.trim()}
                      loading={updateMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-foreground-subtle">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      {note.updated_at !== note.created_at && " (edited)"}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleStartEdit(note)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-error hover:text-error"
                        onClick={() => setDeleteId(note.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-error">Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note?
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-foreground-muted">
              This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
