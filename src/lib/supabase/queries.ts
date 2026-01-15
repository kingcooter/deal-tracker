import { createClient } from "./client";
import type { Database } from "./types";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type DealWorkflow = Database["public"]["Tables"]["deal_workflows"]["Row"];
type DealWorkflowInsert = Database["public"]["Tables"]["deal_workflows"]["Insert"];
type WorkflowTemplate = Database["public"]["Tables"]["workflow_templates"]["Row"];

// Extended types for joined queries
type DealWorkflowWithTemplate = DealWorkflow & {
  template: WorkflowTemplate | null;
};

type TaskWithContacts = Task & {
  assignee: Contact | null;
  owner: Contact | null;
};

// ============================================
// DEALS
// ============================================

export async function getDeals(): Promise<Deal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getDeal(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDeal(deal: DealInsert): Promise<Deal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deals")
    .insert(deal as never)
    .select()
    .single();

  if (error) throw error;
  return data as Deal;
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deals")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Deal;
}

export async function deleteDeal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("deals").delete().eq("id", id);

  if (error) throw error;
}

// ============================================
// CONTACTS
// ============================================

export async function getContacts(): Promise<Contact[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getContact(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createContact(contact: ContactInsert): Promise<Contact> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert(contact as never)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) throw error;
}

// ============================================
// WORKFLOW TEMPLATES
// ============================================

export async function getWorkflowTemplates() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workflow_templates")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

// ============================================
// DEAL WORKFLOWS
// ============================================

export async function getDealWorkflows(dealId: string): Promise<DealWorkflowWithTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_workflows")
    .select(`
      *,
      template:workflow_templates(*)
    `)
    .eq("deal_id", dealId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as unknown as DealWorkflowWithTemplate[];
}

export async function createDealWorkflow(workflow: DealWorkflowInsert): Promise<DealWorkflowWithTemplate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_workflows")
    .insert(workflow as never)
    .select(`
      *,
      template:workflow_templates(*)
    `)
    .single();

  if (error) throw error;
  return data as unknown as DealWorkflowWithTemplate;
}

export async function deleteDealWorkflow(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("deal_workflows").delete().eq("id", id);

  if (error) throw error;
}

// ============================================
// TASKS
// ============================================

// Extended type with deal info
type TaskWithDealInfo = Task & {
  assignee: Contact | null;
  owner: Contact | null;
  workflow: {
    id: string;
    deal_id: string;
    name: string | null;
    deal: {
      id: string;
      name: string;
      status: string;
    } | null;
  } | null;
};

export async function getAllTasks(): Promise<TaskWithDealInfo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:contacts!tasks_assignee_id_fkey(*),
      owner:contacts!tasks_owner_id_fkey(*),
      workflow:deal_workflows(
        id,
        deal_id,
        name,
        deal:deals(id, name, status)
      )
    `)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as TaskWithDealInfo[];
}

export async function getTasksForWorkflow(workflowId: string): Promise<TaskWithContacts[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:contacts!tasks_assignee_id_fkey(*),
      owner:contacts!tasks_owner_id_fkey(*)
    `)
    .eq("workflow_id", workflowId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as unknown as TaskWithContacts[];
}

export async function getTasksForDeal(dealId: string): Promise<TaskWithContacts[]> {
  const supabase = createClient();

  // First get all workflow IDs for this deal
  const { data: workflows, error: workflowError } = await supabase
    .from("deal_workflows")
    .select("id")
    .eq("deal_id", dealId);

  if (workflowError) throw workflowError;
  if (!workflows || workflows.length === 0) return [];

  const workflowIds = (workflows as { id: string }[]).map((w) => w.id);

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:contacts!tasks_assignee_id_fkey(*),
      owner:contacts!tasks_owner_id_fkey(*)
    `)
    .in("workflow_id", workflowIds)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as unknown as TaskWithContacts[];
}

export async function createTask(task: TaskInsert): Promise<TaskWithContacts> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert(task as never)
    .select(`
      *,
      assignee:contacts!tasks_assignee_id_fkey(*),
      owner:contacts!tasks_owner_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data as unknown as TaskWithContacts;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<TaskWithContacts> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(updates as never)
    .eq("id", id)
    .select(`
      *,
      assignee:contacts!tasks_assignee_id_fkey(*),
      owner:contacts!tasks_owner_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data as unknown as TaskWithContacts;
}

export async function deleteTask(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
}

// ============================================
// DEAL CONTACTS (junction table)
// ============================================

export async function getDealContacts(dealId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_contacts")
    .select(`
      *,
      contact:contacts(*)
    `)
    .eq("deal_id", dealId);

  if (error) throw error;
  return data;
}

export async function addContactToDeal(dealId: string, contactId: string, relationship?: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("deal_contacts")
    .insert({ deal_id: dealId, contact_id: contactId, relationship } as never);

  if (error) throw error;
}

export async function removeContactFromDeal(dealId: string, contactId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("deal_contacts")
    .delete()
    .eq("deal_id", dealId)
    .eq("contact_id", contactId);

  if (error) throw error;
}

// ============================================
// DEAL DOCUMENTS
// ============================================

export async function getDealDocuments(dealId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_documents")
    .select("*")
    .eq("deal_id", dealId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createDealDocument(document: {
  deal_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  description?: string;
  user_id: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_documents")
    .insert(document as never)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDealDocument(id: string, updates: {
  file_name?: string;
  category?: string;
  description?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_documents")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDealDocument(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("deal_documents")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============================================
// CONTACT DETAILS (for contact profile page)
// ============================================

export async function getContactDeals(contactId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_contacts")
    .select(`
      *,
      deal:deals(*)
    `)
    .eq("contact_id", contactId);

  if (error) throw error;
  return data;
}

// ============================================
// DEAL NOTES
// ============================================

export async function getDealNotes(dealId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_notes")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createDealNote(note: {
  deal_id: string;
  content: string;
  user_id: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_notes")
    .insert(note as never)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDealNote(id: string, updates: { content: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deal_notes")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDealNote(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("deal_notes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============================================
// CONTACT DETAILS (for contact profile page)
// ============================================

export async function getContactTasks(contactId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      workflow:deal_workflows(
        id,
        name,
        deal:deals(id, name)
      )
    `)
    .eq("assignee_id", contactId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}
