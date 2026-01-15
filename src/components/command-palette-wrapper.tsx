"use client";

import { useCommand } from "@/components/providers/command-provider";
import { CommandPalette } from "@/components/command-palette";

export function CommandPaletteWrapper() {
    const { open, setOpen } = useCommand();
    return <CommandPalette open={open} onOpenChange={setOpen} />;
}
