"use server";

import { createClient } from "./server";
import type { DealInsert, DealUpdate } from "./types";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createDealAction(deal: Partial<DealInsert>) {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Cast to any to bypass strict type checking on the generated types mismatch
    const { data, error } = await supabase
        .from("deals")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - resolve build conflict
        .insert({ ...deal, user_id: user.id } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    // Create default workflows and tasks for the new deal
    const dealData = data as unknown as { id: string };
    await createDefaultWorkflowsForDeal(supabase, dealData.id);

    revalidatePath("/deals");
    revalidatePath("/tasks");
    return data;
}

/**
 * Creates default workflow instances and their starter tasks for a new deal.
 * This is called automatically when a deal is created.
 */
async function createDefaultWorkflowsForDeal(
    supabase: SupabaseClient,
    dealId: string
): Promise<void> {
    // 1. Get default workflow templates
    const { data: templates, error: templatesError } = await supabase
        .from("workflow_templates")
        .select("id, name, sort_order")
        .eq("is_default", true)
        .order("sort_order", { ascending: true });

    if (templatesError || !templates?.length) {
        console.error("Failed to fetch workflow templates:", templatesError);
        return;
    }

    // 2. Create workflow instances for each template
    const workflowInserts = templates.map((template) => ({
        deal_id: dealId,
        template_id: template.id,
        name: template.name,
        sort_order: template.sort_order,
    }));

    const { data: workflows, error: workflowError } = await supabase
        .from("deal_workflows")
        .insert(workflowInserts)
        .select("id, template_id");

    if (workflowError || !workflows?.length) {
        console.error("Failed to create workflows:", workflowError);
        return;
    }

    // 3. Get task templates for all workflow templates
    const templateIds = templates.map((t) => t.id);
    const { data: taskTemplates, error: taskTemplatesError } = await supabase
        .from("task_templates")
        .select("*")
        .in("workflow_template_id", templateIds)
        .order("sort_order", { ascending: true });

    if (taskTemplatesError || !taskTemplates?.length) {
        // No task templates yet - this is OK, just skip task creation
        return;
    }

    // 4. Map task templates to actual tasks with workflow IDs
    const taskInserts = workflows.flatMap((workflow) => {
        const relatedTasks = taskTemplates.filter(
            (tt) => tt.workflow_template_id === workflow.template_id
        );
        return relatedTasks.map((tt) => ({
            workflow_id: workflow.id,
            task: tt.task,
            priority: tt.default_priority,
            status: "not_started" as const,
            sort_order: tt.sort_order,
        }));
    });

    if (taskInserts.length > 0) {
        const { error: tasksError } = await supabase
            .from("tasks")
            .insert(taskInserts);

        if (tasksError) {
            console.error("Failed to create tasks:", tasksError);
        }
    }
}

export async function updateDealAction(id: string, updates: DealUpdate) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("deals")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - resolve build conflict
        .update(updates as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/deals");
    revalidatePath(`/deals/${id}`);
    return data;
}

export async function deleteDealAction(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("deals").delete().eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/deals");
}
