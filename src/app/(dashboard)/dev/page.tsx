"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { seedExampleData, cleanupSeedData } from "@/lib/seed-data";
import { useToastActions } from "@/components/ui/toast";

export default function DevPage() {
  const [seeding, setSeeding] = React.useState(false);
  const [cleaning, setCleaning] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const toast = useToastActions();

  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);
    try {
      const data = await seedExampleData();
      setResult(JSON.stringify(data, null, 2));
      toast.success("Seed data created", "Example deal, tasks, and contacts have been added");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Seed failed", message);
      setResult(`Error: ${message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleCleanup = async () => {
    setCleaning(true);
    setResult(null);
    try {
      await cleanupSeedData();
      setResult("Seed data cleaned up successfully");
      toast.success("Cleanup complete", "Seed data has been removed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Cleanup failed", message);
      setResult(`Error: ${message}`);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Developer Tools</h1>
        <p className="text-sm text-foreground-muted">
          Development utilities for testing and debugging
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-foreground">Seed Data</h2>
        <p className="text-sm text-foreground-muted">
          Create example data for testing: Riverside Commons Acquisition deal with 5 tasks and 3 contacts.
        </p>

        <div className="flex gap-3">
          <Button onClick={handleSeed} loading={seeding}>
            Seed Example Data
          </Button>
          <Button variant="outline" onClick={handleCleanup} loading={cleaning}>
            Cleanup Seed Data
          </Button>
        </div>

        {result && (
          <pre className="mt-4 p-4 bg-neutral-900 rounded-lg text-xs text-foreground-muted overflow-auto max-h-96">
            {result}
          </pre>
        )}
      </Card>
    </div>
  );
}
