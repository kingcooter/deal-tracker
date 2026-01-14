"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Header } from "@/components/layout/header";
import { MobileSidebar, MobileMenuButton } from "@/components/layout/mobile-sidebar";
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
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } = useCommandPalette();
  const { isOpen: searchOpen, setIsOpen: setSearchOpen } = useGlobalSearchModal();
  const { showHelp, setShowHelp } = useShortcutsHelp();

  // Enable navigation shortcuts (G, C, S)
  useNavigationShortcuts();

  return (
    <SidebarProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
            />
          </div>

          {/* Mobile sidebar */}
          <MobileSidebar open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen} />

          <div className="flex flex-1 flex-col overflow-hidden">
            <Header
              onSearchClick={() => setSearchOpen(true)}
              mobileMenuButton={
                <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
              }
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
          <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
        </div>
      </ToastProvider>
    </SidebarProvider>
  );
}
