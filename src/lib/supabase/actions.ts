"use server";

import { createClient } from "./server";
import type { DealInsert, DealUpdate } from "./types";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/deals");
    return data;
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
