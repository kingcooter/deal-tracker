/**
 * Seed Data Utility
 * Creates example data for testing the UI
 *
 * Run this from a client component or via the browser console
 */

import { createClient } from "./supabase/client";

export async function seedExampleData() {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Must be logged in to seed data");
  }

  const userId = user.id;

  console.log("Starting seed data creation...");

  // Step 1: Create example deal
  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .insert({
      name: "Riverside Commons Acquisition",
      address: "1847 Riverside Dr",
      city: "Austin",
      state: "TX",
      zip: "78741",
      property_type: "multifamily",
      status: "active", // Maps to "Under Contract" in UI
      notes: "Value-add opportunity in growing Austin market. 24 units, built 1985, excellent bones.",
      sf: 18500,
      year_built: 1985,
      user_id: userId,
    } as never)
    .select()
    .single();

  if (dealError || !deal) {
    console.error("Deal creation error:", dealError);
    throw dealError || new Error("Deal not created");
  }
  const dealRecord = deal as { id: string; name: string };
  console.log("Created deal:", dealRecord.name);

  // Step 2: Get a workflow template (Due Diligence)
  const { data: templates, error: templateError } = await supabase
    .from("workflow_templates")
    .select("*")
    .eq("name", "Due Diligence")
    .limit(1);

  if (templateError) {
    console.error("Template fetch error:", templateError);
    throw templateError;
  }

  const templateRecords = templates as { id: string }[] | null;
  let templateId = templateRecords?.[0]?.id;

  // If no template exists, create one
  if (!templateId) {
    const { data: newTemplate, error: createTemplateError } = await supabase
      .from("workflow_templates")
      .insert({
        name: "Due Diligence",
        icon: "search",
        color: "#10b981",
        is_default: true,
        sort_order: 1,
      } as never)
      .select()
      .single();

    if (createTemplateError) {
      console.error("Template creation error:", createTemplateError);
      throw createTemplateError;
    }
    const newTemplateRecord = newTemplate as { id: string };
    templateId = newTemplateRecord.id;
  }

  // Step 3: Create deal workflow
  const { data: workflow, error: workflowError } = await supabase
    .from("deal_workflows")
    .insert({
      deal_id: dealRecord.id,
      template_id: templateId,
      name: "Due Diligence",
      sort_order: 0,
    } as never)
    .select()
    .single();

  if (workflowError) {
    console.error("Workflow creation error:", workflowError);
    throw workflowError;
  }
  const workflowRecord = workflow as { id: string; name: string };
  console.log("Created workflow:", workflowRecord.name);

  // Step 4: Create contacts
  const contactsData = [
    {
      name: "Sarah Chen",
      role: "broker",
      company: "Keller Williams",
      email: "sarah.chen@kw.com",
      phone: "(512) 555-0147",
      notes: "Seller's agent, very responsive",
      user_id: userId,
    },
    {
      name: "Marcus Williams",
      role: "lender",
      company: "First Republic Bank",
      email: "mwilliams@firstrepublic.com",
      phone: "(512) 555-0293",
      notes: "Primary lender contact",
      user_id: userId,
    },
    {
      name: "Jennifer Torres",
      role: "attorney",
      company: "Torres Law Group",
      email: "jt@torreslaw.com",
      phone: "(512) 555-0384",
      notes: "Real estate attorney handling closing",
      user_id: userId,
    },
  ];

  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .insert(contactsData as never)
    .select();

  if (contactsError) {
    console.error("Contacts creation error:", contactsError);
    throw contactsError;
  }
  const contactRecords = contacts as { id: string }[];
  console.log("Created contacts:", contactRecords.length);

  // Step 5: Link contacts to deal
  const dealContactsData = contactRecords.map((contact, index) => ({
    deal_id: dealRecord.id,
    contact_id: contact.id,
    relationship: ["Seller's Agent", "Lender", "Attorney"][index],
  }));

  const { error: linkError } = await supabase
    .from("deal_contacts")
    .insert(dealContactsData as never);

  if (linkError) {
    console.error("Deal contacts link error:", linkError);
    throw linkError;
  }
  console.log("Linked contacts to deal");

  // Step 6: Create tasks
  const tasksData = [
    {
      workflow_id: workflowRecord.id,
      task: "Complete environmental inspection",
      status: "completed" as const,
      priority: "high" as const,
      due_date: "2025-01-12",
      sort_order: 0,
    },
    {
      workflow_id: workflowRecord.id,
      task: "Review title commitment",
      status: "in_progress" as const,
      priority: "high" as const,
      due_date: "2025-01-16",
      sort_order: 1,
    },
    {
      workflow_id: workflowRecord.id,
      task: "Submit loan application",
      status: "not_started" as const,
      priority: "medium" as const,
      due_date: "2025-01-20",
      sort_order: 2,
    },
    {
      workflow_id: workflowRecord.id,
      task: "Schedule property walkthrough",
      status: "not_started" as const,
      priority: "low" as const,
      due_date: "2025-01-22",
      sort_order: 3,
    },
    {
      workflow_id: workflowRecord.id,
      task: "Negotiate seller credits",
      status: "blocked" as const,
      priority: "high" as const,
      due_date: "2025-01-18",
      notes: "Waiting on inspection report",
      sort_order: 4,
    },
  ];

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .insert(tasksData as never)
    .select();

  if (tasksError) {
    console.error("Tasks creation error:", tasksError);
    throw tasksError;
  }
  const taskRecords = tasks as { id: string }[];
  console.log("Created tasks:", taskRecords.length);

  console.log("Seed data creation complete!");

  return {
    deal: dealRecord,
    workflow: workflowRecord,
    contacts: contactRecords,
    tasks: taskRecords,
  };
}

// Cleanup function to remove seed data
export async function cleanupSeedData() {
  const supabase = createClient();

  // Delete the example deal (cascades to workflows, tasks, deal_contacts)
  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("name", "Riverside Commons Acquisition");

  if (error) {
    console.error("Cleanup error:", error);
    throw error;
  }

  // Delete the example contacts
  const { error: contactsError } = await supabase
    .from("contacts")
    .delete()
    .in("name", ["Sarah Chen", "Marcus Williams", "Jennifer Torres"]);

  if (contactsError) {
    console.error("Contacts cleanup error:", contactsError);
  }

  console.log("Seed data cleaned up!");
}
