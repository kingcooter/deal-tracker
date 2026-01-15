export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      deals: {
        Row: {
          id: string;
          name: string;
          status: "active" | "closed" | "on-hold";
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          property_type: string | null;
          image_url: string | null;
          notes: string | null;
          sf: number | null;
          lot_size: number | null;
          year_built: number | null;
          zoning: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: "active" | "closed" | "on-hold";
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          property_type?: string | null;
          image_url?: string | null;
          notes?: string | null;
          sf?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          zoning?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: "active" | "closed" | "on-hold";
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          property_type?: string | null;
          image_url?: string | null;
          notes?: string | null;
          sf?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          zoning?: string | null;
          updated_at?: string;
        };
      };
      workflow_templates: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          color: string | null;
          is_default: boolean;
          sort_order: number;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          sort_order?: number;
          user_id?: string | null;
        };
        Update: {
          name?: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          sort_order?: number;
        };
      };
      deal_workflows: {
        Row: {
          id: string;
          deal_id: string;
          template_id: string;
          name: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          template_id: string;
          name?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          sort_order?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          workflow_id: string;
          task: string;
          status: "not_started" | "in_progress" | "blocked" | "completed";
          priority: "low" | "medium" | "high" | "urgent";
          assignee_id: string | null;
          owner_id: string | null;
          opened_at: string;
          due_date: string | null;
          completed_at: string | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          task: string;
          status?: "not_started" | "in_progress" | "blocked" | "completed";
          priority?: "low" | "medium" | "high" | "urgent";
          assignee_id?: string | null;
          owner_id?: string | null;
          opened_at?: string;
          due_date?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          task?: string;
          status?: "not_started" | "in_progress" | "blocked" | "completed";
          priority?: "low" | "medium" | "high" | "urgent";
          assignee_id?: string | null;
          owner_id?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          role: string | null;
          notes: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          role?: string | null;
          notes?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          role?: string | null;
          notes?: string | null;
        };
      };
      deal_contacts: {
        Row: {
          deal_id: string;
          contact_id: string;
          relationship: string | null;
        };
        Insert: {
          deal_id: string;
          contact_id: string;
          relationship?: string | null;
        };
        Update: {
          relationship?: string | null;
        };
      };
      task_templates: {
        Row: {
          id: string;
          workflow_template_id: string;
          task: string;
          default_priority: "low" | "medium" | "high" | "urgent";
          sort_order: number;
        };
        Insert: {
          id?: string;
          workflow_template_id: string;
          task: string;
          default_priority?: "low" | "medium" | "high" | "urgent";
          sort_order?: number;
        };
        Update: {
          task?: string;
          default_priority?: "low" | "medium" | "high" | "urgent";
          sort_order?: number;
        };
      };
      deal_notes: {
        Row: {
          id: string;
          deal_id: string;
          content: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      deal_documents: {
        Row: {
          id: string;
          deal_id: string;
          file_name: string;
          file_url: string;
          file_size: number | null;
          file_type: string | null;
          category: "contract" | "inspection" | "appraisal" | "title" | "environmental" | "survey" | "lease" | "financial" | "photo" | "legal" | "permit" | "other";
          description: string | null;
          uploaded_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          file_name: string;
          file_url: string;
          file_size?: number | null;
          file_type?: string | null;
          category?: "contract" | "inspection" | "appraisal" | "title" | "environmental" | "survey" | "lease" | "financial" | "photo" | "legal" | "permit" | "other";
          description?: string | null;
          uploaded_at?: string;
          user_id: string;
        };
        Update: {
          file_name?: string;
          category?: "contract" | "inspection" | "appraisal" | "title" | "environmental" | "survey" | "lease" | "financial" | "photo" | "legal" | "permit" | "other";
          description?: string | null;
        };
      };
    };
  };
}

// Helper types
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
export type DealUpdate = Database["public"]["Tables"]["deals"]["Update"];

export type WorkflowTemplate = Database["public"]["Tables"]["workflow_templates"]["Row"];
export type DealWorkflow = Database["public"]["Tables"]["deal_workflows"]["Row"];
export type DealWorkflowInsert = Database["public"]["Tables"]["deal_workflows"]["Insert"];

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

export type TaskTemplate = Database["public"]["Tables"]["task_templates"]["Row"];

export type DealDocument = Database["public"]["Tables"]["deal_documents"]["Row"];
export type DealDocumentInsert = Database["public"]["Tables"]["deal_documents"]["Insert"];
export type DealDocumentUpdate = Database["public"]["Tables"]["deal_documents"]["Update"];
export type DocumentCategory = DealDocument["category"];

export type DealNote = Database["public"]["Tables"]["deal_notes"]["Row"];
export type DealNoteInsert = Database["public"]["Tables"]["deal_notes"]["Insert"];
export type DealNoteUpdate = Database["public"]["Tables"]["deal_notes"]["Update"];
