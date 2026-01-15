"use client";

import * as React from "react";

interface CommandContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
}

const CommandContext = React.createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    const toggle = React.useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    return (
        <CommandContext.Provider value={{ open, setOpen, toggle }}>
            {children}
        </CommandContext.Provider>
    );
}

export function useCommand() {
    const context = React.useContext(CommandContext);
    if (context === undefined) {
        throw new Error("useCommand must be used within a CommandProvider");
    }
    return context;
}
