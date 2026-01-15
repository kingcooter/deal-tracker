"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { NavigationTabs } from "@/components/layout/navigation-tabs";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";
import { GlobalSearch, useGlobalSearchModal } from "@/components/global-search";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { useNavigationShortcuts, useShortcutsHelp } from "@/lib/hooks/use-keyboard-shortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } = useCommandPalette();
  const { isOpen: searchOpen, setIsOpen: setSearchOpen } = useGlobalSearchModal();
  const { showHelp, setShowHelp } = useShortcutsHelp();

  // Enable navigation shortcuts (G, C, S)
  useNavigationShortcuts();

  return (
    <ToastProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Top Navigation Stack */}
        <div className="flex-shrink-0 z-10 relative">
          <Header
            onSearchClick={() => setSearchOpen(true)}
          />
          <NavigationTabs />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>

        {/* Global Overlays */}
        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
      </div>
    </ToastProvider>
  );
}
